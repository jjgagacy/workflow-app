import { useAppStore } from "@/app/components/app/store";
import { CodeNodeData } from "../types";
import { useGetNodeDefaultConfig } from "@/api/graphql/workflow";
import { CodeLanguage } from "../../../types";
import { useCallback, useEffect, useState } from "react";
import { useWorkflowStore } from "../../../context";
import { useSyncNodeInputs } from "../../../hooks/use-syncNodeInputs";
import { produce } from "immer";

export const useConfig = (nodeId: string, codeData: CodeNodeData) => {
  const { appInfo } = useAppStore();
  const appId = appInfo?.id;
  const getNodeDefaultConfig = useGetNodeDefaultConfig();
  const [languageDefaultConfig, setLanguageDefaultConfig] = useState<Record<CodeLanguage, CodeNodeData> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false)
  const activePanel = useWorkflowStore((state) => state.activePanel);
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);

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

  const handleLanguageChange = useCallback((language: CodeLanguage, isInit: boolean = false) => {
    const codeConfig = languageDefaultConfig?.[language];

    const newInputs = produce(nodeInputs, (draft) => {
      draft.language = language;
      if (!codeConfig) {
        return;
      }
      draft.inputs = codeConfig.inputs ?? [];
      draft.outputs = codeConfig.outputs ?? [];
      draft.code = codeConfig.code ?? '';
    });
    syncNodeInputs(newInputs);

    if (activePanel?.type === 'node' && activePanel.node?.id === nodeId) {
      updateActivePanelNode({
        ...activePanel.node,
        data: {
          ...activePanel.node.data,
          ...newInputs,
        },
      });
    }

    if (isInit) {
      setIsInitialized(true);
    }
  }, [languageDefaultConfig, nodeInputs, syncNodeInputs, activePanel, nodeId, updateActivePanelNode]);


  useEffect(() => {
    if (nodeInputs.code) {
      // todo: syncNodeInputs(nodeDefaultConfig);
      return;
    }
    // console.log(nodeInputs, 'nodeInputs', nodeDefaultConfig, 'nodeDefaultConfig');
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

  useEffect(() => {
    if ((languageDefaultConfig && codeData.language) && languageDefaultConfig[codeData.language] && !isInitialized) {
      handleLanguageChange(codeData.language, true);
    }
  }, [languageDefaultConfig, isInitialized, codeData.language, handleLanguageChange]);

  return {
    languageDefaultConfig,
    handleLanguageChange,
  };
}
