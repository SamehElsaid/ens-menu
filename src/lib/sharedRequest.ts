const inFlightRequests = new Map<string, Promise<unknown>>();

/** Shares only concurrent work; settled results are never cached. */
export function getSharedRequest<T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const request = load();
  inFlightRequests.set(key, request);
  const clear = () => {
    if (inFlightRequests.get(key) === request) {
      inFlightRequests.delete(key);
    }
  };
  void request.then(clear, clear);
  return request;
}
