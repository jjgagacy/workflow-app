
import { Popover } from '@/app/components/base/popover';
import { cn } from '@/utils/classnames';
import type { ModelProviderModels, SelectModel } from '@/types/model';
import { ModelPickerTrigger } from './model-pickerTrigger';
import { ModelPopList } from './model-popList';

type ModelPickerProps = {
  selectedModel?: SelectModel;
  modelList: ModelProviderModels[];
  onSelect: (model: SelectModel) => void;
  readonly?: boolean;
  className?: string;
  placeholder?: string;
};

export const ModelPicker = ({
  selectedModel,
  modelList,
  onSelect,
  readonly,
  className,
  placeholder,
}: ModelPickerProps) => {
  return (
    <div className={cn('h-full w-full', className)}>
      <Popover
        trigger={(
          <div className="w-full cursor-pointer">
            <ModelPickerTrigger
              selectedModel={selectedModel}
              modelList={modelList}
              readonly={readonly}
              placeholder={placeholder}
            />
          </div>
        )}
        direction="bottom"
        gap={4}
        offset={0}
        padding={8}
        triggerClassName="h-full w-full"
        panelClassName="space-y-3 overflow-hidden!"
        sameWidth={false}
        disabled={readonly}
        portal={true}
      >
        {({ close }) => (
          <ModelPopList
            modelList={modelList}
            selectedModel={selectedModel}
            onSelect={(model) => {
              onSelect(model);
              close();
            }}
          />
        )}
      </Popover>
    </div>
  );
};

