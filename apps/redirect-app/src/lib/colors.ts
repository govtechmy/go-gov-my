export const colors = {
  black900: '#18181b',
  black800: '#27272a',
  black700: '#3f3f46',

  baseWhite: '#ffffff',

  dim500: '#71717a',

  outline400: '#a1a1aa',
  outline300: '#d4d4d8',
  outline200: '#e4e4e7',

  washed100: '#f4f4f5',

  background50: '#fafafa',

  brand600: '#2563eb',
  brand700: '#1d4ed8',
  brand300: '#96b7ff',
  brand200: '#c2d5ff',
  brand50: '#eff6ff',
  brandTextOnly: '#1d4ed866', // 40% opacity

  success300: '#83daa3',
  success200: '#bbf7d0',
  success50: '#f0fdf4',

  grayTextOnlyDisabled: '#18181b66', // 40% opacity
  grayWashed100: '#f4f4f5',
  grayFocusWashed100: '#fafafa',
  grayOutline300: '#d4d4d8',
  grayOutline200: '#e4e4e7',
  grayDim500: '#71717a',

  whiteBackground0: '#ffffff',
  whiteFocusWhite100: '#ffffff',
  whiteFocusWhite200: '#ffffff',
  whiteTextDisabled: '#ffffff66', // 40% opacity
  whiteForceWhite: '#ffffff',
};

export const darkColors = {
  black900: '#ffffff',
  black800: '#f4f4f5',
  black700: '#d4d4d8',
  baseWhite: '#18181b',

  dim500: '#a1a1aa',

  outline400: '#52525b',
  outline300: '#3f3f46',
  outline200: '#27272a',

  washed100: '#1d1d21',

  background50: '#161619',

  brand600: '#2563eb',
  brand700: '#588bfb',
  brand300: '#1e40af',
  brand200: '#1e3a8a',
  brand50: '#0f1836',
  brandTextOnly: '#588bfb66', // 40% opacity

  success300: '#166534',
  success200: '#14532d',
  success50: '#052e16',

  grayTextOnlyDisabled: '#a1a1aa66', // 40% opacity
  grayWashed100: '#1d1d21',
  grayFocusWashed100: '#27272a',
  grayOutline300: '#3f3f46',
  grayOutline200: '#27272a',
  grayDim500: '#a1a1aa',

  whiteBackground0: '#161619',
  whiteFocusWhite100: '#1d1d21',
  whiteFocusWhite200: '#27272a',
  whiteTextDisabled: '#ffffff66', // 40% opacity
  whiteForceWhite: '#ffffff',
};

export type ColorName = keyof typeof colors;

export function getColor(name: ColorName, type: string | undefined) {
  if (type === 'dark') {
    return darkColors[name];
  }
  return colors[name];
}
