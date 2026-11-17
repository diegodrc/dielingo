import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { seededRandom, shuffle } from './shuffle';

export interface Settings {
  /** Show pinyin above Chinese text. */
  showPinyin: boolean;
  /** Base speech rate (0.1–2). */
  speechRate: number;
  /** Read the prompt aloud as soon as an exercise appears. */
  autoPlay: boolean;
  /** Shuffle options and tiles (each config can still opt out). */
  shuffle: boolean;
  /** Fixed seed for reproducible shuffles (tests, screenshots). */
  seed?: number;
}

export const defaultSettings: Settings = {
  showPinyin: true,
  speechRate: 0.9,
  autoPlay: false,
  shuffle: true,
};

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  update: () => {},
});

/** Optional: exercises work without it, using `defaultSettings`. */
export function SettingsProvider({
  children,
  ...initial
}: Partial<Settings> & { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings, ...initial });
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );
  const value = useMemo(() => ({ settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

/**
 * Whether Chinese text plays its sound when tapped. Each exercise provides
 * the value for its own content (see `tapToSpeakEnabled`).
 */
export const TapToSpeakContext = createContext(true);

/**
 * Shuffles once, when the component mounts. Remount the exercise (change its
 * `key`) to get a new order. `salt` keeps two lists in the same exercise from
 * getting the same permutation when a seed is set.
 */
export function useShuffled<T>(items: readonly T[], enabled: boolean | undefined, salt = 0): T[] {
  const { settings } = useSettings();
  const [result] = useState(() => {
    if (enabled === false || !settings.shuffle) return [...items];
    const random = settings.seed === undefined ? Math.random : seededRandom(settings.seed + salt);
    return shuffle(items, random);
  });
  return result;
}
