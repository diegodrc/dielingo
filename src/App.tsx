import { useEffect, useState } from 'react';
import { cx } from './lib/cx';
import { useSettings } from './lib/settings';
import { useVoiceStatus } from './lib/speech';
import { Lesson } from './components/shell/Lesson';
import { demoLesson } from './examples';
import { Gallery } from './pages/Gallery';
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
  const onLesson = hash.startsWith('#/lesson');
  const exampleCode = hash.startsWith('#/ex/') ? hash.slice('#/ex/'.length) : undefined;

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
          <a href="#/" className={cx(styles.navLink, !onLesson && styles.navActive)}>
            Exercises
          </a>
          <a href="#/lesson" className={cx(styles.navLink, onLesson && styles.navActive)}>
            Demo lesson
          </a>
        </nav>
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
          <div className={styles.card}>
            <Lesson exercises={demoLesson} />
          </div>
        ) : (
          <Gallery selectedCode={exampleCode} />
        )}
      </main>
    </div>
  );
}
