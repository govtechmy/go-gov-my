import sharedConfig from '@gogovmy/tailwind-config/tailwind.config.ts';
import type { Config } from 'tailwindcss';

const config: Pick<Config, 'presets'> = {
  presets: [
    {
      ...sharedConfig,
      content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './ui/**/*.{js,ts,jsx,tsx}',
        // h/t to https://www.willliu.com/blog/Why-your-Tailwind-styles-aren-t-working-in-your-Turborepo
        '../../packages/ui/src/**/*{.js,.ts,.jsx,.tsx}',
      ],
      theme: {
        extend: {
          fontFamily: {
            inter: ['var(--font-inter)'],
            poppins: ['var(--font-poppins)'],
          },
          ...sharedConfig?.theme?.extend,
          animation: {
            ...sharedConfig?.theme?.extend?.animation,
            // Infinite scroll animation
            'infinite-scroll': 'infinite-scroll 22s linear infinite',
            // Text appear animation
            'text-appear': 'text-appear 0.15s ease',
            // Logo popup animation in welcome flow
            scaleBlur: 'scaleBlur 1.0s ease-out',
          },
          keyframes: {
            ...sharedConfig?.theme?.extend?.keyframes,
            // Infinite scroll animation
            'infinite-scroll': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-150%)' },
            },
            // Text appear animation
            'text-appear': {
              '0%': {
                opacity: '0',
                transform: 'rotateX(45deg) scale(0.95)',
              },
              '100%': {
                opacity: '1',
                transform: 'rotateX(0deg) scale(1)',
              },
            },
            // Logo popup in welcome page
            scaleBlur: {
              '0%': { transform: 'scale(0.25)', filter: 'blur(4px)' },
              '100%': { transform: 'scale(1)', filter: 'blur(0px)' },
            },
          },
        },
      },
    },
  ],
};

export default config;
