export type ClassWithMarker<T, S extends symbol> =
  { new(...args: any[]): T } &
  { [K in S]: true };
