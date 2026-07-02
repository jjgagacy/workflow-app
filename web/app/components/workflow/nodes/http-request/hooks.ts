import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

export const useHttpRequestSelectItems = () => {
  const { t } = useTranslation();

  const methodItems = useMemo<SelectItem[]>(
    () => [
      { value: "GET", name: "GET" },
      { value: "POST", name: "POST" },
      { value: "PUT", name: "PUT" },
      { value: "PATCH", name: "PATCH" },
      { value: "DELETE", name: "DELETE" },
      { value: "HEAD", name: "HEAD" },
      { value: "OPTIONS", name: "OPTIONS" },
    ],
    [],
  );

  const bodyTypeItems = useMemo<SelectItem[]>(
    () => [
      { value: "none", name: t("workflow.nodes.http-request.bodyType.none") },
      {
        value: "form-data",
        name: t("workflow.nodes.http-request.bodyType.formData"),
      },
      {
        value: "x-www-form-urlencoded",
        name: t("workflow.nodes.http-request.bodyType.urlencoded"),
      },
      { value: "json", name: t("workflow.nodes.http-request.bodyType.json") },
      { value: "raw", name: t("workflow.nodes.http-request.bodyType.raw") },
      { value: "binary", name: t("workflow.nodes.http-request.bodyType.binary") },
    ],
    [t],
  );

  const exceptionStrategyItems = useMemo<SelectItem[]>(
    () => [
      {
        value: "stop-execution",
        name: t("workflow.nodes.http-request.exceptionStrategy.stopExecution.name"),
        description: t("workflow.nodes.http-request.exceptionStrategy.stopExecution.description"),
      },
      {
        value: "return-default",
        name: t("workflow.nodes.http-request.exceptionStrategy.returnDefault.name"),
        description: t("workflow.nodes.http-request.exceptionStrategy.returnDefault.description"),
      },
    ],
    [t],
  );

  return {
    methodItems,
    bodyTypeItems,
    exceptionStrategyItems,
  };
};
