export function sum<Type extends number | bigint>(a: Type, b: Type): Type {
  return (a as any) + (b as any) as Type;
}
