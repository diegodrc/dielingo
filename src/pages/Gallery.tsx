import { useEffect, useState } from 'react';
import { cx } from '../lib/cx';
import { Exercise } from '../components/shell/Exercise';
import { allExamples, sections } from '../examples';
import styles from './pages.module.css';

/** Catalogue of the exercise types: pick one, try it, and see its config. */
export function Gallery({ selectedCode }: { selectedCode?: string }) {
  const example = allExamples.find((e) => e.code === selectedCode) ?? allExamples[0];
  // Bumped on Continue so the same example starts over.
  const [attempt, setAttempt] = useState(0);

  // A new example starts at the top of the page.
  // (Braces matter: newer browsers return a promise from scrollTo.)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [example.code]);

  return (
    <div className={styles.gallery}>
      <nav className={styles.sidebar} aria-label="Exercise types">
        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.list}>
              {section.examples.map((e) => (
                <li key={e.code}>
                  <a
                    href={`#/ex/${e.code}`}
                    className={cx(styles.item, e.code === example.code && styles.itemActive)}
                    aria-current={e.code === example.code ? 'page' : undefined}
                  >
                    <span className={styles.code}>{e.code}</span>
                    {e.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.detail}>
        <div className={styles.detailHeader}>
          <h1>
            <span className={styles.detailCode}>{example.code}</span>
            {example.title}
          </h1>
          <p>{example.goal}</p>
        </div>

        <div className={styles.card}>
          <Exercise
            key={`${example.code}-${attempt}`}
            config={example.config}
            onContinue={() => setAttempt((n) => n + 1)}
          />
        </div>

        <details className={styles.config}>
          <summary>
            Config for this exercise <code>{`{ type: '${example.config.type}' }`}</code>
          </summary>
          <pre>{JSON.stringify(example.config, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
