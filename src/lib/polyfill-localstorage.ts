// Provide a minimal no-op localStorage for server environment to avoid
// packages that access localStorage at module-evaluation time.
declare const global: any;

if (typeof globalThis.localStorage === "undefined" || typeof (globalThis.localStorage as any).getItem !== "function") {
  (globalThis as any).localStorage = {
    getItem: (_key: string) => null,
    setItem: (_key: string, _val: string) => {},
    removeItem: (_key: string) => {},
    clear: () => {},
  };
}
