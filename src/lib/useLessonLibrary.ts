import { useCallback, useMemo, useState } from 'react';
import {
  folderLessons,
  LessonFormatError,
  lessonToJson,
  loadProgress,
  loadUploads,
  parseLessonText,
  saveProgress,
  saveUploads,
  slugify,
  type LessonEntry,
  type ProgressMap,
} from './lessons';

const MAX_FILE_BYTES = 1024 * 1024;

export interface ImportResult {
  file: string;
  /** Title of the lesson when it was imported. */
  title?: string;
  /** True when it replaced an earlier upload of the same file name. */
  replaced?: boolean;
  /** Why it was rejected. */
  problems?: string[];
}

/** Lessons from the folder plus the ones uploaded in this browser, with progress. */
export function useLessonLibrary() {
  const [uploads, setUploads] = useState(loadUploads);
  const [progress, setProgress] = useState(loadProgress);
  const lessons = useMemo(() => [...folderLessons, ...uploads], [uploads]);

  const importFiles = useCallback(
    async (files: File[]): Promise<ImportResult[]> => {
      let next = uploads;
      const results: ImportResult[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_BYTES) {
          results.push({ file: file.name, problems: ['The file is larger than 1 MB.'] });
          continue;
        }
        try {
          const lesson = parseLessonText(await file.text());
          const entry: LessonEntry = { id: `upload-${slugify(file.name)}`, source: 'upload', ...lesson };
          const replaced = next.some((l) => l.id === entry.id);
          next = [...next.filter((l) => l.id !== entry.id), entry];
          results.push({ file: file.name, title: lesson.title, replaced });
        } catch (error) {
          results.push({
            file: file.name,
            problems: error instanceof LessonFormatError ? error.problems : [String(error)],
          });
        }
      }

      if (next !== uploads) {
        if (!saveUploads(next)) {
          return files.map((file) => ({
            file: file.name,
            problems: ['The browser could not save the lesson (storage is full or disabled).'],
          }));
        }
        setUploads(next);
      }
      return results;
    },
    [uploads],
  );

  const removeLesson = useCallback(
    (id: string) => {
      const next = uploads.filter((l) => l.id !== id);
      saveUploads(next);
      setUploads(next);
      const { [id]: _removed, ...rest } = progress;
      saveProgress(rest);
      setProgress(rest);
    },
    [uploads, progress],
  );

  const recordCompletion = useCallback((id: string, accuracy: number) => {
    setProgress((current: ProgressMap) => {
      const before = current[id];
      const next = {
        ...current,
        [id]: {
          completions: (before?.completions ?? 0) + 1,
          bestAccuracy: Math.max(before?.bestAccuracy ?? 0, accuracy),
        },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  return { lessons, progress, importFiles, removeLesson, recordCompletion };
}

/** Saves a lesson to the learner's computer as a .json file. */
export function downloadLesson(lesson: LessonEntry): void {
  const url = URL.createObjectURL(new Blob([lessonToJson(lesson)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${lesson.id.replace(/^upload-/, '')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
