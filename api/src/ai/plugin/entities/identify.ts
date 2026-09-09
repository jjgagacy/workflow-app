export const pluginIdentifierRexexp = /^(?:([a-z0-9_-]{1,64})\/)?([a-z0-9_-]{1,255})(:([0-9]{1,4})(\.[0-9]{1,4}){1,3})?(-\w{1,16})?(@[a-f0-9]{32,64})?$/;

// matches a plain plugin_id like `author/name`, without a version (`:x.y.z`) or hash (`@...`) suffix
export const pluginIdRegexp = /^[a-z0-9_-]{1,64}\/[a-z0-9_-]{1,255}$/;

export function isValidPluginUniqueIdentifier(identifier: string): boolean {
  return pluginIdentifierRexexp.test(identifier);
}

export function isPluginId(identifier: string): boolean {
  return pluginIdRegexp.test(identifier);
}

export function marshalPluginID(author: string, name: string, version: string): string {
  if (!name || !version) {
    throw new Error('Plugin name and version are required');
  }
  if (!author) {
    return `${name}:${version}`;
  }
  return `${author}/${name}:${version}`;
}

export function getPluginIdFromUniqueIdentifier(identifier: string): string | null {
  const match = pluginIdentifierRexexp.exec(identifier);
  if (!match) {
    return null;
  }
  const author = match[1];
  const name = match[2];
  if (!author || !name) {
    return null;
  }
  return `${author}/${name}`;
}

export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const length = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < length; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA !== numB) {
      return numA - numB;
    }
  }
  return 0;
}