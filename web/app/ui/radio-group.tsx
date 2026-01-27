'use client';

import { cn } from '@/utils/classnames';
import * as React from 'react';
import { Radio } from './radio';
import { Label } from './label';

// RadioGroup 上下文
interface RadioGroupContextValue {
  value: string | number;
  onValueChange: (value: string | number) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup<T>() {
  const context = React.useContext(RadioGroupContext) as RadioGroupContextValue | null;
  if (!context) {
    throw new Error("useRadioGroup must be used within a RadioGroup");
  }
  return context;
}

// RadioGroup 组件
interface RadioGroupProps {
  value?: string | number;
  defaultValue?: string | number | undefined;
  onValueChange?: (value: string | number) => void;
  name: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = React.forwardRef<
  HTMLDivElement,
  RadioGroupProps
>(({ value: valueProp, defaultValue, onValueChange, name, disabled = false, className, children, orientation = 'vertical', ...props }: RadioGroupProps, ref) => {
  const [internalValue, setInternalValue] = React.useState<string | number | undefined>(defaultValue);
  const value = typeof valueProp !== 'undefined' ? valueProp : internalValue;
  const handleValueChange = React.useCallback((newValue: string | number) => {
    if (disabled) return;
    setInternalValue(newValue);
    onValueChange?.(newValue);
  }, [valueProp, disabled, onValueChange]);

  const contextValue = React.useMemo(() => ({
    value,
    onValueChange: handleValueChange,
    name,
    disabled
  }), [value, handleValueChange, name, disabled]) as RadioGroupContextValue;

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot='radio-group'
        className={cn(
          'flex gap-3',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

RadioGroup.displayName = 'RadioGroup';

// RadioGroupItem 组件
interface RadioGroupItemProps {
  value: string | number;
  disabled?: boolean;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value: itemValue, disabled: itemDisabled = false, className, id, children, ...props }, ref) => {
    const { name: groupName, value, disabled: groupDisabled, onValueChange } = useRadioGroup();
    const isChecked = itemValue === value;
    const disabled = itemDisabled || groupDisabled;
    const idValue = id || React.useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onValueChange(itemValue);
      }
    }

    return (
      <div className='flex items-center space-x-2'>
        <Radio
          ref={ref}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          name={groupName}
          value={value}
          className={className}
          id={idValue}
          {...props}
        />
        {children && (
          <Label
            htmlFor={idValue}
            className={cn(
              'text-sm font-medium cursor-pointer select-none',
              disabled && 'cursor-not-allowed opacity-50 text-gray-400',
              !disabled && 'text-gray-700 dark:text-gray-300'
            )}
          >
            {children}
          </Label>
        )}
      </div>
    );
  }
);
