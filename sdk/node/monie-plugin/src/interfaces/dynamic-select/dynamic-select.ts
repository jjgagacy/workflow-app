import { ClassWithMarker } from "../marker.class";

export const DYNAMIC_SELECT_SYMBOL = Symbol.for('plugin.dynamicselect.model');
export abstract class DynamicSelect {
  static [DYNAMIC_SELECT_SYMBOL] = true;
  fetchParameterOptions(parameter: string): Promise<any[]> {
    throw new Error(`Not impl`);
  }
}

export type DynamicSelectClassType = ClassWithMarker<DynamicSelect, typeof DYNAMIC_SELECT_SYMBOL>;
export function isDynamicSelectClass(cls: any): cls is DynamicSelectClassType {
  return Boolean(cls?.[DYNAMIC_SELECT_SYMBOL]);
}
