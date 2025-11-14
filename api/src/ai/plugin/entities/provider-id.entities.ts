import { BadRequestException, NotFoundException } from "@nestjs/common";

const cache = new Map<string, string>();

export class ProviderID {
  organization: string;

  pluginName: string;

  providerName: string;

  toString(): string {
    return `${this.organization}/${this.pluginName}/${this.providerName}`;
  }

  constructor(value: string) {
    if (!value) {
      throw new NotFoundException('plugin not found');
    }
    if (!this.isValidFormat(value)) {
      if (/^[a-z0-9_-]+$/.test(value)) {
        value = `monie/${value}/${value}`;
      } else {
        throw new BadRequestException(`Invalid plugin id: ${value}`);
      }
    }

    const parts = value.split('/');
    this.organization = parts[0];
    this.pluginName = parts[1];
    this.providerName = parts[2];
  }

  private isValidFormat(value: string): boolean {
    return /^[a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_-]+$/.test(value);
  }

  get pluginId(): string {
    return `${this.pluginName}/${this.providerName}`;
  }
}

export class ModelProviderID extends ProviderID {
  constructor(value: string) {
    super(value);
  }
}

export class ToolProviderID extends ProviderID {
  constructor(value: string) {
    super(value);
  }
}


export function normalizeProviderName(name: string): string {
  if (!cache.has(name)) {
    cache.set(name, new ModelProviderID(name).toString());
  }
  return cache.get(name)!;
}

