import theme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ["!./node_modules/**/*", "./**/*.twig", "./src/**/*.{js,css}"],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: "1.5rem"
      }
    },
    extend: {
      colors: {
        "primary": 'rgb(var(--color-primary) / <alpha-value>)',
        "secondary": 'rgb(var(--color-secondary) / <alpha-value>)',
        "tertiary": 'rgb(var(--color-tertiary) / <alpha-value>)',
        "accent": 'rgb(var(--color-accent) / <alpha-value>)',
        "contrast-primary": 'rgb(var(--color-contrast-primary) / <alpha-value>)',
        "contrast-secondary": 'rgb(var(--color-contrast-secondary) / <alpha-value>)',
        "contrast-accent": 'rgb(var(--color-contrast-accent) / <alpha-value>)',
        "line-primary": 'rgb(var(--color-line-primary) / <alpha-value>)',
        "line-secondary": 'rgb(var(--color-line-secondary) / <alpha-value>)',
        "line-tertiary": 'rgb(var(--color-line-tertiary) / <alpha-value>)',
        "line-accent": 'rgb(var(--color-line-accent) / <alpha-value>)',
        "info": 'rgb(var(--color-info) / <alpha-value>)',
        "success": 'rgb(var(--color-success) / <alpha-value>)',
        "failure": 'rgb(var(--color-failure) / <alpha-value>)',
      },
      fontFamily: {
        primary: 'var(--font-family-primary)',
        secondary: 'var(--font-family-secondary)',
      },

      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--color-primary))',
            '--tw-prose-headings': 'rgb(var(--color-primary))',
            '--tw-prose-lead': 'rgb(var(--color-primary))',
            '--tw-prose-links': 'rgb(var(--color-primary))',
            '--tw-prose-bold': 'rgb(var(--color-primary))',
            '--tw-prose-counters': 'rgb(var(--color-secondary))',
            '--tw-prose-bullets': 'rgb(var(--color-secondary))',
            '--tw-prose-hr': 'rgb(var(--color-line-tertiary))',
            '--tw-prose-quotes': 'rgb(var(--color-secondary))',
            '--tw-prose-quote-borders': 'rgb(var(--color-line-tertiary))',
            '--tw-prose-captions': 'rgb(var(--color-secondary))',
            '--tw-prose-code': 'rgb(var(--color-primary))',
            '--tw-prose-pre-code': 'rgb(var(--color-primary))',
            '--tw-prose-pre-bg': 'rgb(var(--color-contrast-primary))',
            '--tw-prose-th-borders': 'rgb(var(--color-line-tertiary))',
            '--tw-prose-td-borders': 'rgb(var(--color-line-tertiary))',
          }
        }
      },

      borderRadius: {
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [
  ],
}

