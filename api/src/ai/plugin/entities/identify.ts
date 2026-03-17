export const pluginIdentifierRexexp = /^(?:([a-z0-9_-]{1,64})\/)?([a-z0-9_-]{1,255})(:([0-9]{1,4})(\.[0-9]{1,4}){1,3})?(-\w{1,16})?(@[a-f0-9]{32,64})?$/;

export function isValidPluginUniqueIdentifier(identifier: string): boolean {
  return pluginIdentifierRexexp.test(identifier);
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