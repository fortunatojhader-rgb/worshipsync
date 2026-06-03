import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ backgroundColor: '#000' }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, shrink-to-fit=no" />

        <script dangerouslySetInnerHTML={{ __html: `
            (function() {
                try {
                    const storage = localStorage.getItem('theme-storage');
                    const theme = storage ? JSON.parse(storage).state.theme : 'system';
                    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (isDark) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.backgroundColor = '#000';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.backgroundColor = '#fff';
                    }
                } catch (e) {}
            })();
        `}} />

        <ScrollViewStyleReset />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Bloqueia gestos de zoom (pinça) no iOS
              document.addEventListener('gesturestart', function (e) {
                e.preventDefault();
              }, { passive: false });

              document.addEventListener('gesturechange', function (e) {
                e.preventDefault();
              }, { passive: false });

              document.addEventListener('gestureend', function (e) {
                e.preventDefault();
              }, { passive: false });

              // Bloqueia multitoque que pode causar zoom
              document.addEventListener('touchstart', function (e) {
                if (e.touches.length > 1) {
                  e.preventDefault();
                }
              }, { passive: false });

              // Bloqueia zoom por scroll (Ctrl + Mouse Wheel)
              document.addEventListener('wheel', function (e) {
                if (e.ctrlKey) {
                  e.preventDefault();
                }
              }, { passive: false });

              // Bloqueia zoom por teclado (Ctrl + +/-)
              document.addEventListener('keydown', function (e) {
                if (e.ctrlKey && (e.keyCode === 61 || e.keyCode === 107 || e.keyCode === 173 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189)) {
                  e.preventDefault();
                }
              }, { passive: false });
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: '#000' }}>{children}</body>
    </html>
  );
}
