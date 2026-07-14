// ============================================================
// ThemeBackground — fixed gradient layer (avoids repaint flash)
// ============================================================

import { useEffect } from 'react';
import { getTheme } from '../data/themes';

interface ThemeBackgroundProps {
  themeId?: string | null;
}

function gradientFirstColor(gradient: string): string {
  const match = gradient.match(/#[0-9a-fA-F]{6}/);
  return match?.[0] ?? '#0d1b4b';
}

export function ThemeBackground({ themeId }: ThemeBackgroundProps) {
  const theme = getTheme(themeId);
  const fallback = gradientFirstColor(theme.background);

  useEffect(() => {
    document.body.style.backgroundColor = fallback;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [fallback]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: theme.background,
        transition: 'background 0.4s ease',
      }}
    />
  );
}
