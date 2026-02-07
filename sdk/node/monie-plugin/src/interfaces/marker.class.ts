import { AnyConstructor } from "../core/classes/module-loader.js";

export type ClassWithMarker<T, S extends symbol> =
  { new(...args: any[]): T } &
  { [K in S]: true };

export function hasStaticMarker(cls: AnyConstructor, marker: symbol): boolean {
  return Boolean((cls as any)[marker]);
}
