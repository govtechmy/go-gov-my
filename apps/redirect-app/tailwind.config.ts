import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      screens: {
        xl: '1280px',
      },
      padding: {
        DEFAULT: '18px',
        sm: '18px',
        md: '24px',
        lg: '24px',
        xl: '24px',
      },
    },
    extend: {
      screens: {
        tall: { raw: '(min-height: 720px)' },
      },
      animation: {
        // Define additional animations here
      },
      backgroundImage: {
        // Define gradient backgrounds here
      },
      boxShadow: {
        button: '0 1px 3px 0 rgba(0, 0, 0, 0.07)',
        card: '0px 2px 6px 0 rgba(0, 0, 0, 0.05), 0px 6px 24px 0 rgba(0, 0, 0, 0.05)',
      },
      colors: {
        brand: {
          ['50']: 'rgb(var(--brand-50) / <alpha-value>)',
          ['200']: 'rgb(var(--brand-200) / <alpha-value>)',
          ['300']: 'rgb(var(--brand-300) / <alpha-value>)',
          ['600']: colors.blue[600],
          ['700']: colors.blue[700],
          ['text_only']: 'rgb(var(--brand-text_only) / 0.4)',
        },
        foreground: {
          DEFAULT: 'rgb(var(--brand-700) / <alpha-value>)',
          success: colors.green[700],
        },
        background: {
          DEFAULT: 'rgb(var(--base-white) / <alpha-value>)',
          50: 'rgb(var(--background-50) / <alpha-value>)',
        },
        washed: {
          100: 'rgb(var(--washed-100) / <alpha-value>)',
        },
        outline: {
          200: 'rgb(var(--outline-200) / <alpha-value>)',
          300: 'rgb(var(--outline-300) / <alpha-value>)',
          400: 'rgb(var(--outline-400) / <alpha-value>)',
        },
        dim: {
          500: 'rgb(var(--dim-500) / <alpha-value>)',
        },
        black: {
          700: 'rgb(var(--black-700) / <alpha-value>)',
          800: 'rgb(var(--black-800) / <alpha-value>)',
          900: 'rgb(var(--black-900) / <alpha-value>)',
        },
        gray: {
          ['text_only-disabled']: 'rgb(var(--gray-text_only-disabled) / 0.4)',
          ['washed-100']: 'rgb(var(--gray-washed-100) / <alpha-value>)',
          ['focus_washed-100']: 'rgb(var(--gray-focus_washed-100) / <alpha-value>)',
          ['outline-200']: 'rgb(var(--gray-outline-200) / <alpha-value>)',
          ['outline-300']: 'rgb(var(--gray-outline-300) / <alpha-value>)',
          ['dim-500']: 'rgb(var(--gray-dim-500) / <alpha-value>)',
        },
        success: {
          50: 'rgb(var(--success-50) / <alpha-value>)',
          200: 'rgb(var(--success-200) / <alpha-value>)',
          300: 'rgb(var(--success-300) / <alpha-value>)',
          600: colors.green[600],
          700: colors.green[700],
        },
        danger: {
          ['50']: 'rgb(var(--danger-50) / <alpha-value>)',
          ['200']: 'rgb(var(--danger-200) / <alpha-value>)',
          ['300']: 'rgb(var(--danger-300) / <alpha-value>)',
          ['600']: 'rgb(var(--danger-600) / <alpha-value>)',
          ['700']: 'rgb(var(--danger-700) / <alpha-value>)',
          ['text_only']: 'rgb(var(--danger-text_only) / 0.4)',
        },
        white: {
          ['background-0']: 'rgb(var(--white-background-0) / <alpha-value>)',
          ['focus_white-100']: 'rgb(var(--white-focus_white-100) / <alpha-value>)',
          ['focus_white-200']: 'rgb(var(--white-focus_white-200) / <alpha-value>)',
          ['text_only-disabled']: 'rgb(var(--white-text_only-disabled) / 0.4)',
          ['force_white']: 'rgb(var(--white-force_white) / <alpha-value>)',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)'],
        body: ['var(--font-inter)'],
      },
      fontSize: {
        ['xs']: ['12px', '18px'],
        ['sm']: ['14px', '20px'],
        ['base']: ['16px', '24px'],
        ['lg']: ['18px', '26px'],
        ['xl']: ['20px', '30px'],
      },
      keyframes: {
        // Define additional keyframes here
      },
      spacing: {
        4.5: '18px',
      },
    },
  },
  darkMode: 'selector',
  plugins: [tailwindcssAnimate],
};
export default config;
