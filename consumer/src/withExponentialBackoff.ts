export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelayMs: number
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxRetries) {
        throw error;
      }
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
      delay *= 2;
    }
  }
}
