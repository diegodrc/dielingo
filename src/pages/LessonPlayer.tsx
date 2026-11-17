import { Lesson } from '../components/shell/Lesson';
import type { LessonEntry } from '../lib/lessons';
import styles from './pages.module.css';

interface LessonPlayerProps {
  lesson: LessonEntry | undefined;
  onComplete: (id: string, accuracy: number) => void;
}

export function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  if (!lesson) {
    return (
      <div className={styles.notFound}>
        <h1>Lesson not found</h1>
        <p>It may have been deleted, or it was uploaded in another browser.</p>
        <a href="#/">Back to lessons</a>
      </div>
    );
  }

  return (
    <div className={styles.player}>
      <div className={styles.playerBar}>
        <a href="#/" className={styles.quit} aria-label="Quit lesson" title="Quit lesson">
          ✕
        </a>
        <span>{lesson.title}</span>
      </div>
      <div className={styles.card}>
        <Lesson
          key={lesson.id}
          exercises={lesson.exercises}
          onComplete={(result) => onComplete(lesson.id, result.accuracy)}
          onExit={() => {
            window.location.hash = '#/';
          }}
        />
      </div>
    </div>
  );
}
