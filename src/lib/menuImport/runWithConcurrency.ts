/** Run async tasks with a fixed concurrency limit. */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  if (tasks.length === 0) return [];

  const results = new Array<T>(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const current = nextIndex++;
      results[current] = await tasks[current]();
    }
  }

  const workers = Math.min(Math.max(1, concurrency), tasks.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
