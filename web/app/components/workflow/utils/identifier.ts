export const relaxedPluginIdentifierRegexp =
  /^(?:([a-z0-9_-]{1,64})\/)?([a-z0-9_-]{1,255})(?:\/[^:\-@]+)?(:([0-9]{1,4})(\.[0-9]{1,4}){1,3})?(-\w{1,16})?(@[a-f0-9]{32,64})?$/;

export function toPluginId(identifier: string): string {
  const parts = identifier.split('/');

  // 如果超过两段（例如 org / plugin / sub），只取前两段重组
  if (parts.length > 2) {
    return `${parts[0]}/${parts[1]}`;
  }

  return identifier;
}
