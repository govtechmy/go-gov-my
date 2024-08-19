export async function retryWithDelay(
  fn: () => Promise<void>,
  attempt = 0,
  delay = 60000,
) {
  try {
    await fn();
  } catch (err) {
    console.error(`Attempt ${attempt + 1} failed:`, err);
    setTimeout(
      () => retryWithDelay(fn, attempt + 1, delay),
      delay + Math.random() * 5000,
    );
  }
}
