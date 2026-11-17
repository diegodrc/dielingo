import { useRef, useState, type DragEvent } from 'react';
import { cx } from '../lib/cx';
import { folderProblems, type LessonEntry } from '../lib/lessons';
import { downloadLesson, type ImportResult, type useLessonLibrary } from '../lib/useLessonLibrary';
import shell from '../components/shell/shell.module.css';
import styles from './pages.module.css';

type Library = ReturnType<typeof useLessonLibrary>;

/** Home page: every lesson from the folder and from this browser, plus upload. */
export function Lessons({ library }: { library: Library }) {
  const { lessons, progress, importFiles, removeLesson } = library;
  const input = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [dragging, setDragging] = useState(false);

  const add = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setResults(await importFiles([...files]));
    if (input.current) input.current.value = '';
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void add(event.dataTransfer.files);
  };

  const remove = (lesson: LessonEntry) => {
    if (window.confirm(`Delete “${lesson.title}” from this browser? This cannot be undone.`)) {
      removeLesson(lesson.id);
    }
  };

  return (
    <div className={styles.lessons}>
      <div className={styles.lessonsHeader}>
        <div>
          <h1>Lessons</h1>
          <p>Pick a lesson to practise, or add your own from a .json file.</p>
        </div>
        <button
          type="button"
          className={cx(shell.button, shell.primary)}
          onClick={() => input.current?.click()}
        >
          Upload lesson
        </button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          multiple
          hidden
          aria-label="Upload lesson files"
          onChange={(e) => void add(e.target.files)}
        />
      </div>

      {results.length > 0 && (
        <ul className={styles.results} aria-live="polite">
          {results.map((result) => (
            <li key={result.file} className={result.problems ? styles.resultBad : styles.resultOk}>
              <strong>{result.file}</strong>
              {result.problems ? (
                <>
                  <span> could not be added:</span>
                  <ul>
                    {result.problems.slice(0, 6).map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                    {result.problems.length > 6 && <li>…and {result.problems.length - 6} more.</li>}
                  </ul>
                </>
              ) : (
                <span>
                  {' '}
                  {result.replaced ? 'replaced' : 'added'} “{result.title}”.
                </span>
              )}
            </li>
          ))}
          <li>
            <button type="button" className={styles.dismiss} onClick={() => setResults([])}>
              Dismiss
            </button>
          </li>
        </ul>
      )}

      {folderProblems.map(({ file, problems }) => (
        <p key={file} className={styles.resultBad} role="alert">
          <strong>lessons/{file}</strong> was skipped: {problems[0]}
          {problems.length > 1 && ` (+${problems.length - 1} more)`}
        </p>
      ))}

      <div className={styles.lessonGrid}>
        {lessons.map((lesson, index) => {
          const done = progress[lesson.id];
          const count = lesson.exercises.length;
          return (
            <article key={lesson.id} className={cx(styles.lessonCard, done && styles.lessonDone)}>
              <div className={styles.lessonTop}>
                <span className={styles.lessonNumber} aria-hidden="true">
                  {done ? '✓' : index + 1}
                </span>
                {lesson.source === 'upload' && <span className={styles.tag}>Uploaded</span>}
              </div>
              <h2>{lesson.title}</h2>
              {lesson.description && <p>{lesson.description}</p>}
              <p className={styles.lessonMeta}>
                {count} {count === 1 ? 'exercise' : 'exercises'}
                {done && ` · best ${done.bestAccuracy}% · done ${done.completions}×`}
              </p>
              <div className={styles.lessonActions}>
                <a href={`#/lesson/${lesson.id}`} className={cx(shell.button, shell.primary, styles.start)}>
                  {done ? 'Practice' : 'Start'}
                </a>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => downloadLesson(lesson)}
                  aria-label={`Download ${lesson.title} as JSON`}
                  title="Download .json"
                >
                  ⬇
                </button>
                {lesson.source === 'upload' && (
                  <button
                    type="button"
                    className={cx(styles.iconButton, styles.iconDanger)}
                    onClick={() => remove(lesson)}
                    aria-label={`Delete ${lesson.title}`}
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            </article>
          );
        })}

        <div
          className={cx(styles.dropzone, dragging && styles.dropzoneActive)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <span className={styles.dropIcon} aria-hidden="true">
            ＋
          </span>
          <strong>Add a lesson</strong>
          <span>
            Drop .json files here or{' '}
            <button type="button" className={styles.linkButton} onClick={() => input.current?.click()}>
              browse
            </button>
            . Download an existing lesson to use as a template.
          </span>
        </div>
      </div>
    </div>
  );
}
