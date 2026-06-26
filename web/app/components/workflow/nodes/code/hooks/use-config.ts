import { useAppStore } from "@/app/components/app/store";
import { CodeNodeData } from "../types";
import { useGetNodeDefaultConfig } from "@/api/graphql/workflow";
import { CodeLanguage } from "../../../types";
import { useEffect, useState } from "react";
import { useWorkflowStore } from "../../../context";
import { useSyncNodeInputs } from "../../../hooks/use-syncNodeInputs";

export const useConfig = (nodeId: string, codeData: CodeNodeData) => {
  const { appInfo } = useAppStore();
  const appId = appInfo?.id;
  const getNodeDefaultConfig = useGetNodeDefaultConfig();
  const [languageDefaultConfig, setLanguageDefaultConfig] = useState<Record<CodeLanguage, CodeNodeData> | null>(null);

  const isAppReady = !!appId && !!codeData?.type;
  const nodeDefaultConfig = useWorkflowStore((state) => state.nodeDefaultConfig);
  const { nodeInputs, syncNodeInputs } = useSyncNodeInputs(nodeId, codeData);

  const { data: javascriptDefaultConfig } = getNodeDefaultConfig({
    nodeType: codeData.type,
    codeLanguage: CodeLanguage.javascript
  }, { enabled: isAppReady });

  const { data: pythonDefaultConfig } = getNodeDefaultConfig({
    nodeType: codeData.type,
    codeLanguage: CodeLanguage.python
  }, { enabled: isAppReady });

  useEffect(() => {

    if (nodeInputs.code) {
      // todo: syncNodeInputs(nodeDefaultConfig);
      return;
    }

    console.log(nodeInputs, 'nodeInputs', nodeDefaultConfig, 'nodeDefaultConfig');

  }, [nodeDefaultConfig]);

  useEffect(() => {
    if (appId) {
      if (javascriptDefaultConfig && pythonDefaultConfig) {
        setLanguageDefaultConfig({
          [CodeLanguage.javascript]: javascriptDefaultConfig.config as CodeNodeData,
          [CodeLanguage.python]: pythonDefaultConfig.config as CodeNodeData
        });
      }
    }
  }, [appId, javascriptDefaultConfig, pythonDefaultConfig]);

  return {
    languageDefaultConfig
  };
}
