import { loadYamlFile } from "../../../../utils/yaml.util.js";
import { ProviderConfig } from "../provider.js";
import { ToolConfigurationExtra } from "./extra.js";

export class EndpointConfigurationExtra extends ToolConfigurationExtra {
}

export class EndpointConfiguration {
  path: string;
  method: string;
  hidden: boolean = false;
  extra: EndpointConfigurationExtra;

  constructor(data: Partial<EndpointConfiguration> = {}) {
    this.path = data.path || '';
    this.method = data.method || '';
    this.hidden = data.hidden || false;
    this.extra = data.extra || new EndpointConfigurationExtra();
  }

  static create(data: any): EndpointConfiguration {
    return new EndpointConfiguration(data);
  }
}

export class EndpointProviderConfiguration {
  settings: ProviderConfig[] = [];
  endpoints: string[] = [];

  constructor(data: Partial<EndpointProviderConfiguration>) {
    this.settings = data.settings || [];
    this.endpoints = data.endpoints || [];
  }

  static async validateEndpoints(value: any): Promise<EndpointConfiguration[]> {
    if (!Array.isArray(value)) {
      throw new Error('endpoints should be a list');
    }

    const endpoints: EndpointConfiguration[] = [];

    for (const endpoint of value) {
      if (endpoint instanceof EndpointConfiguration) {
        endpoints.push(endpoint);
        continue;
      }

      if (typeof endpoint === 'object' && endpoint !== null) {
        try {
          endpoints.push(EndpointConfiguration.create(endpoint));
          continue;
        } catch (error) {
          throw new Error(`Error creating endpoint from object: ${error}`);
        }
      }

      if (typeof endpoint === 'string') {
        try {
          endpoints.push(await loadYamlFile<EndpointConfiguration>(endpoint));
          continue;
        } catch (error) {
          throw new Error(`Error loading endpoint configuration from ${endpoint}: ${error}`);
        }
      }
    }

    return endpoints;
  }
}

