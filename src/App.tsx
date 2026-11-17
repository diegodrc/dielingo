import { useEffect, useState } from 'react';
import { cx } from './lib/cx';
import { useSettings } from './lib/settings';
import { useVoiceStatus } from './lib/speech';
import { useLessonLibrary } from './lib/useLessonLibrary';
import { Gallery } from './pages/Gallery';
import { LessonPlayer } from './pages/LessonPlayer';
import { Lessons } from './pages/Lessons';
import { isFirstVisit, Tutorial } from './pages/Tutorial';
import styles from './pages/pages.module.css';

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const { settings, update } = useSettings();
  const voice = useVoiceStatus();
  const library = useLessonLibrary();
  // Step of the tutorial that is open, or null. It opens by itself on the first
  // visit, unless the visitor arrived straight into a lesson.
  const [tutorialStep, setTutorialStep] = useState<number | null>(() =>
    isFirstVisit() && !window.location.hash.startsWith('#/lesson/') ? 0 : null,
  );

  // Routes: #/ (lessons) · #/lesson/<id> (play) · #/types[/<code>] (exercise catalogue)
  const lessonId = hash.startsWith('#/lesson/')
    ? decodeURIComponent(hash.slice('#/lesson/'.length))
    : undefined;
  const onLesson = lessonId !== undefined;
  const onTypes = hash.startsWith('#/types');
  const exampleCode = hash.startsWith('#/types/') ? hash.slice('#/types/'.length) : undefined;

  // In a lesson the prompt audio plays by itself; in the catalogue it waits for a tap.
  useEffect(() => {
    update({ autoPlay: onLesson });
  }, [onLesson, update]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <a href="#/" className={styles.logo}>
          <span lang="zh-CN">学</span> Dielingo
        </a>
        <nav className={styles.nav}>
          <a href="#/" className={cx(styles.navLink, !onTypes && styles.navActive)}>
            Lessons
          </a>
          <a href="#/types" className={cx(styles.navLink, onTypes && styles.navActive)}>
            Exercise types
          </a>
        </nav>
        <button
          type="button"
          className={styles.help}
          onClick={() => setTutorialStep(0)}
          aria-label="How it works"
          title="How it works"
        >
          ?
        </button>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.showPinyin}
            onChange={(e) => update({ showPinyin: e.target.checked })}
          />
          Pinyin
        </label>
      </header>

      {(voice === 'missing' || voice === 'unsupported') && (
        <p className={styles.warning} role="alert">
          {voice === 'missing'
            ? 'No Chinese voice is installed in this browser, so audio may be silent or wrong. On Windows, add Chinese (Simplified) under Settings → Time & language → Speech.'
            : 'This browser does not support speech synthesis, so audio exercises will be silent.'}
        </p>
      )}

      <main className={styles.main}>
        {onLesson ? (
          <LessonPlayer
            lesson={library.lessons.find((l) => l.id === lessonId)}
            onComplete={library.recordCompletion}
          />
        ) : onTypes ? (
          <Gallery selectedCode={exampleCode} />
        ) : (
          <Lessons library={library} onCreateWithAi={() => setTutorialStep(2)} />
        )}
      </main>

      {tutorialStep !== null && (
        <Tutorial
          key={tutorialStep}
          startStep={tutorialStep}
          firstLessonId={onLesson ? undefined : library.lessons[0]?.id}
          onClose={() => setTutorialStep(null)}
        />
      )}
    </div>
  );
}
