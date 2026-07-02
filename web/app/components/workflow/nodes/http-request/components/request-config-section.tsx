import { SimpleSelect } from "@/app/ui/select";
import { NodeInput } from "../../../components/base/node-input";
import type { HttpMethod } from "../types";
import type { SelectItem } from "./types";
import { useTranslation } from "react-i18next";

type RequestConfigSectionProps = {
  url: string;
  method: HttpMethod;
  methodItems: SelectItem[];
  onUrlChange: (value: string) => void;
  onMethodChange: (value: HttpMethod) => void;
};

const RequestConfigSection = ({
  url,
  method,
  methodItems,
  onUrlChange,
  onMethodChange,
}: RequestConfigSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-4 rounded-xl bg-muted/15 px-4 py-4">
      {/* 模块标题 */}
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
        {t('workflow.nodes.http-request.requestConfig')}
      </div>

      {/* 内部表单区域：使用 flex-col 强制所有元素垂直堆叠，各自独占一行 */}
      <div className="flex flex-col gap-4">
        {/* 1. HTTP Method 区域 */}
        <div className="w-full md:max-w-xs !max-w-[150px]"> {/* 在桌面端限制一下下拉框的最大宽度，防止拉得太长变形 */}
          <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.http-request.method')}
          </div>
          <SimpleSelect
            items={methodItems}
            defaultValue={method}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => onMethodChange(item.value as HttpMethod)}
          />
        </div>

        {/* 2. URL 区域（完全独占一行） */}
        <label className="block w-full">
          <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.http-request.url')}
          </div>
          <NodeInput
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://api.example.com/v1/resource"
            className="w-full"
          />
        </label>
      </div>
    </section>
  );
};

export default RequestConfigSection;