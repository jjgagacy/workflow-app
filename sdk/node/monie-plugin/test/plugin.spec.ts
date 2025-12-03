import { Plugin } from "@/plugin";

describe('PluginTests', () => {
  it('should start plugin', () => {
    const p = new Plugin();
    p.run();
  })
})
