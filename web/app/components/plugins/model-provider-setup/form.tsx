import { CredentialFormSchema, FormType } from "@/api/graphql/model-provider/types/model-provider";
import { CredentialFormSchemaAll, CredentialFormSchemaNumberInput, CredentialFormSchemaRadio, CredentialFormSchemaSelect } from "../types";
import { FormValue } from "@/api/graphql/model-provider/types/model-provider";
import { cn } from "@/utils/classnames";
import { useTranslation } from "react-i18next";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { Input } from "@/app/ui/input";
import { Radio } from "@/app/ui/radio";
import { useEffect } from "react";
import { SimpleSelect } from "@/app/ui/select";
import { Switch } from "@/app/ui/switch";

type FormProps = {
  formSchemas: Array<CredentialFormSchema | CredentialFormSchemaAll>;
  value: FormValue;
  onChange: (value: FormValue) => void;
  isEditing: boolean;
  className?: string;
  labelClassName?: string;
  itemClassName?: string;
  inputClassName?: string;
  readonly?: boolean;
  useDefaultValue?: boolean;
}

const Form = ({
  formSchemas,
  value,
  onChange,
  isEditing,
  className,
  labelClassName,
  itemClassName,
  inputClassName,
  useDefaultValue,
  readonly
}: FormProps) => {
  const { t } = useTranslation();
  const defaultLocale = getClientLocale();
  const locale = getLanguage(defaultLocale);

  if (false) {
    // formSchemas.push({
    //   type: FormType.RADIO,
    //   variable: 'test_radio' + Math.random(),
    //   default: 'a',
    //   label: {
    //     zh_Hans: '测试单选',
    //     en_US: 'Test Radio',
    //   },
    //   options: [
    //     {
    //       value: 'a',
    //       label: {
    //         zh_Hans: '选项A',
    //         en_US: 'Option A',
    //       }
    //     },
    //     {
    //       value: 'b',
    //       label: {
    //         zh_Hans: '选项B',
    //         en_US: 'Option B',
    //       }
    //     },
    //     {
    //       value: 'c',
    //       label: {
    //         zh_Hans: '选项C',
    //         en_US: 'Option C',
    //       }
    //     },
    //   ]
    // })

    // formSchemas.push({
    //   type: FormType.SELECT,
    //   variable: 'test_select' + Math.random(),
    //   default: 'a',
    //   label: {
    //     zh_Hans: '测试选择',
    //     en_US: 'Test Select',
    //   },
    //   options: [
    //     {
    //       value: 'a',
    //       label: {
    //         zh_Hans: '选项A',
    //         en_US: 'Option A',
    //       }
    //     },
    //     {
    //       value: 'b',
    //       label: {
    //         zh_Hans: '选项B',
    //         en_US: 'Option B',
    //       }
    //     },
    //     {
    //       value: 'c',
    //       label: {
    //         zh_Hans: '选项C',
    //         en_US: 'Option C',
    //       }
    //     },
    //   ]
    // })

    // formSchemas.push({
    //   type: FormType.BOOLEAN,
    //   variable: 'test_boolean' + Math.random(),
    //   default: 'true',
    //   label: {
    //     zh_Hans: '测试开关',
    //     en_US: 'Test Switch',
    //   },
    // })
  }

  const handleFormChange = (key: string, val: any) => {
    onChange({
      ...value,
      [key]: val,
    });
  }

  const renderFormItem = (schema: CredentialFormSchema | CredentialFormSchemaAll) => {
    const isInput = schema.type === FormType.TEXT_INPUT || schema.type === FormType.SECRET_INPUT || schema.type === FormType.NUMBER_INPUT;
    const disabled = readonly;
    if (isInput) {
      const required = schema.required || false;
      return (
        <div key={schema.variable} className={cn(itemClassName, "mb-4 last:mb-0")}>
          <div className={cn(labelClassName, 'flex font-semibold items-center py-2')}>
            {getLocalizedText(schema.label, locale)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <Input
            className={cn(inputClassName, `${disabled ? 'cursor-not-allowed opacity-60' : ''}`)}
            value={(useDefaultValue && (value[schema.variable] === undefined)) ? schema.default || '' : value[schema.variable] || ''}
            disabled={disabled}
            placeholder={getLocalizedText(schema.placeholder, locale)}
            onChange={e => handleFormChange(schema.variable, e.target.value)}
            type={schema.type === FormType.NUMBER_INPUT ? 'number' : schema.type === FormType.SECRET_INPUT ? 'password' : 'text'}
            {...(schema.type === FormType.NUMBER_INPUT && { min: (schema as CredentialFormSchemaNumberInput).min, max: (schema as CredentialFormSchemaNumberInput).max })}
          />
        </div>
      );
    }

    if (schema.type === FormType.RADIO) {
      const { variable, required, options } = schema as CredentialFormSchemaRadio;
      return (
        <div key={schema.variable} className={cn(itemClassName, "mb-4 last:mb-0")}>
          <div className={cn(labelClassName, 'flex font-semibold items-center py-2')}>
            {getLocalizedText(schema.label, locale)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className={cn('grid gap-3', `grid-cols-${options?.length || 1}`)}>
            {options?.map(option => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleFormChange(schema.variable, option.value)}
              >
                <Radio checked={value[variable] === option.value} onChange={() => handleFormChange(variable, option.value)} disabled={readonly} />
                <span>{getLocalizedText(option.label, locale)}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (schema.type === FormType.SELECT) {
      const { options, variable, required, placeholder } = schema as CredentialFormSchemaSelect;
      const selectItems = options?.map(option => ({
        value: option.value,
        name: getLocalizedText(option.label, locale)
      }));
      return (
        <div key={variable} className={cn(itemClassName, 'mb-4 last:mb-0')}>
          <div className={cn(labelClassName, 'flex font-semibold items-center py-2')}>
            {getLocalizedText(schema.label, locale)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <SimpleSelect
            className={cn(inputClassName)}
            disabled={readonly}
            items={selectItems}
            defaultValue={(useDefaultValue && (value[schema.variable] === undefined)) ? schema.default || '' : value[schema.variable] || ''}
            onSelect={item => handleFormChange(variable, item.value as string)}
            placeholder={getLocalizedText(schema.placeholder, locale) || 'select an option'}
          />
        </div>
      );
    }

    if (schema.type === FormType.BOOLEAN) {
      const { variable, required } = schema;
      return (
        <div key={variable} className={cn(itemClassName, 'mb-4 last:mb-0')}>
          <div className={cn(labelClassName, 'flex font-semibold items-center py-2')}>
            {getLocalizedText(schema.label, locale)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <Switch
            checked={value[variable] || false}
            onChange={(checked) => handleFormChange(variable, checked)}
          />
        </div>
      )
    }
  }

  return (
    <div className={className}>
      {formSchemas.map((schema) => renderFormItem(schema))}
    </div>
  );
}

export default Form;