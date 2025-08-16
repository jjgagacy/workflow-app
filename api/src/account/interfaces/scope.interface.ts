export interface ScopeInterface {
  key: string;
  name: string;
}

export const DEFAULT_SCOPE: ScopeInterface[] = [
  { key: '0', name: '本人' },
  { key: '1', name: '本部门' },
];

function getScope(key: string): ScopeInterface | null {
  for (const scope of DEFAULT_SCOPE) {
    if (scope.key === key) {
      return scope;
    }
  }
  return null;
}

export function scopeStringToObject(scope: string): ScopeInterface[] {
  return scope === ''
    ? []
    : scope
        .split(',')
        .map((key) => getScope(key))
        .filter((scope): scope is ScopeInterface => scope !== null);
}
