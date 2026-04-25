import { DEBOUNCE_MS } from "@/hooks/use-data-table";
import { AppIconSource } from "../../base/app-icon";
import { AppMode } from '../constants/appModes';
import { useCallback, useEffect, useRef, useState } from "react";
import { defaultIconSet } from "../../base/app-icon/icons";
import { createApp } from "@/services/apps";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";

interface CreateAppData {
  name: string;
  description: string;
  icon: string;
  iconType: AppIconSource['type'];
  mode: AppMode;
}

interface UseCreateAppOptions {
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  debounceDelay?: number;
}

export function useCreateAppForm(options: UseCreateAppOptions) {
  const { onSuccess, onClose, onError, debounceDelay = DEBOUNCE_MS } = options;

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const createAppMutation = createApp();

  const [formData, setFormData] = useState<CreateAppData>({
    name: "",
    description: "",
    icon: defaultIconSet,
    iconType: "icon" as AppIconSource['type'],
    mode: AppMode.WORKFLOW,
  });

  const [iconSource, setIconSource] = useState<AppIconSource>({
    type: 'icon',
    icon: defaultIconSet
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  // 更新表单字段
  const updateField = useCallback(<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setName = useCallback((name: string) => updateField("name", name), [updateField]);
  const setDescription = useCallback((desc: string) => updateField("description", desc), [updateField]);
  const setMode = useCallback((mode: AppMode) => updateField("mode", mode), [updateField]);

  // 设置图标
  const handleIconSelect = useCallback((icon: AppIconSource) => {
    setIconSource(icon);
    updateField("icon", icon.icon);
    updateField("iconType", icon.type);
    setShowIconPicker(false);
  }, [updateField]);

  // 创建 App 的核心逻辑
  const createAppCore = useCallback(async () => {
    if (!formData.name.trim()) {
      const error = new Error("App name is required");
      setError(error);
      onError?.(error);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const app = await createAppMutation({
        input: {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          iconType: formData.iconType,
          mode: formData.mode,
        }
      });
      onSuccess?.(app);
      onClose?.();
      return app;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create app");
      setError(error);
      onError?.(error);
      toast.error(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }, [formData, onSuccess, onError]);

  // 防抖创建
  const debouncedCreate = useDebounceCallback(createAppCore, debounceDelay);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      icon: defaultIconSet,
      iconType: "icon",
      mode: AppMode.WORKFLOW,
    });
    setIconSource({ type: 'icon', icon: defaultIconSet });
    setError(null);
  }, []);

  // 图标选择器的点击外部逻辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };

    if (showIconPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showIconPicker]);

  return {
    // 表单状态
    formData,
    iconSource,
    showIconPicker,
    isCreating,
    error,

    // 表单方法
    setName,
    setDescription,
    setMode,
    setIconSource,
    setShowIconPicker,

    // 图标选择器
    iconPickerRef,
    handleIconSelect,
    toggleIconPicker: () => setShowIconPicker(prev => !prev),
    closeIconPicker: () => setShowIconPicker(false),

    // 创建操作
    createApp: debouncedCreate,
    createAppImmediate: createAppCore,
    resetForm,

    // 验证
    isValid: formData.name.trim().length > 0,
  };
}
