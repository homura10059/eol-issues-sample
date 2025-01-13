export type Result<T, E = Error | unknown> =
  | { ok: true; value: T }
  | { ok: false; error: E }
