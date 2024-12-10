export function measureTextWidth(text: string, element: HTMLElement) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return null;

  const style = getComputedStyle(element);
  context.font = `${style.getPropertyValue('font-size')} ${style.getPropertyValue('font-family')}`;
  const metrics = context.measureText(text);

  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  };
}
