export function getStylizedNumber(number: number) {
  return number.toLocaleString('en-US');
}

export function formatBigNumber(number: number) {
  if (number >= 1_000_000_000) {
    return number / 1_000_000_000 + 'B';
  } else if (number >= 1_000_000) {
    return number / 1_000_000 + 'M';
  } else if (number >= 1_000) {
    return number / 1_000 + 'K';
  } else {
    return `${number}`;
  }
}
