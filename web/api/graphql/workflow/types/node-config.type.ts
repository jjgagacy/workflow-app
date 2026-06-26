export type GetNodeDefaultConfigResponse = {
  type: string;
  config: Record<string, any>;
}

export type GetNodeDefaultConfigQueryVariables = {
  nodeType: string;
  codeLanguage: string;
}
