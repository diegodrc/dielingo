import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './primitives.module.css';

export type OptionState = 'default' | 'selected' | 'correct' | 'wrong' | 'matched';

interface OptionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: OptionState;
  /** Small keyboard-shortcut badge, e.g. "1". */
  badge?: string;
  children: ReactNode;
}

/** The tappable card used for choices and match items. */
export function OptionCard({ state = 'default', badge, className, children, ...rest }: OptionCardProps) {
  return (
    <button type="button" className={cx(styles.option, styles[`option-${state}`], className)} {...rest}>
      {badge && (
        <span className={styles.badge} aria-hidden="true">
          {badge}
        </span>
      )}
      <span className={styles.optionBody}>{children}</span>
    </button>
  );
}
