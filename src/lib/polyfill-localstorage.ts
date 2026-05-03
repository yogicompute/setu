// Provide a minimal no-op localStorage for server environment to avoid
// packages that access localStorage at module-evaluation time.
if (
  !("localStorage" in globalThis) ||
  typeof (globalThis as { localStorage?: Storage }).localStorage?.getItem !== "function"
) {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (_key: string) => null,
      setItem: (_key: string, _val: string) => {},
      removeItem: (_key: string) => {},
      clear: () => {},
    },
    configurable: true,
  });
}
