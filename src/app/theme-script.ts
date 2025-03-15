// app/theme-script.ts

// Create a new file and export this function
export function themeScript() {
    return `
      (function() {
        try {
          const savedTheme = localStorage.getItem('theme');
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {
          console.error('Theme initialization failed:', e);
        }
      })()
    `;
  }
  
  // Then, in your layout.tsx, add this before the closing </head> tag:
  // <script dangerouslySetInnerHTML={{ __html: themeScript() }} />