import { useTranslation } from "react-i18next";
import { SelectItem } from "./types";


export const useLLM = () => {
  const { t } = useTranslation();

  const exceptionStrategyItems: SelectItem[] = [
    {
      value: "stop-execution",
      name: "停止执行",
      description: "推理异常时立即停止当前执行。",
    },
    {
      value: "return-default",
      name: "返回默认值",
      description: "推理异常时输出预设默认值。",
    },
  ];

  return {
    exceptionStrategyItems,
  };
}