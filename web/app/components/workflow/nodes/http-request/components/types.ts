import type { HttpKeyValueItem } from "../types";

export type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

export type KeyValuePatch = Partial<HttpKeyValueItem>;
