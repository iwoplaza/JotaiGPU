export function isPromiseLike<T>(
  value: PromiseLike<T> | unknown,
): value is PromiseLike<T> {
  return typeof (value as PromiseLike<T>)?.then === "function";
}
