export function debounce<T>(
  callback: (...args: any[]) => Promise<T>,
  waitForMs: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (timeoutId) {
      console.log("Debounce: clearing previous timeout");
      clearTimeout(timeoutId);
    }

    console.log("Debounce: setting new timeout");
    timeoutId = setTimeout(() => {
      callback(...args);
    }, waitForMs);
  };
}
