'use client';

import { cn } from '@/utils/classnames';
import classNames from 'classnames';
import React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues
} from 'react-hook-form';
import { Label } from './label';
import { Slot } from './slot';

export const Form = FormProvider;

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

export const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({...props}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
}

type FormItemContextValue = {
    id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
);

export const FormItem = ({ className, ...props }: React.ComponentProps<'div'>) => {
    const id = React.useId();

    return (
        <FormItemContext.Provider value={{ id }}>
            <div
                data-slot='form-item'
                className={cn('grid gap-2', className)}
                {...props}
            />
        </FormItemContext.Provider>
    );
}


const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = useFormContext();
    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldState) {
        throw new Error('useFormField should be used within <FormField>');
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState
    };
}

export const FormLabel = ({ className, ...props }: React.ComponentProps<typeof Label>) => {
    const { error, formItemId } = useFormField();

    return (
        <Label
            data-slot='form-label'
            data-error={!!error}
            className={cn(
                'data-[error=true]:text-destructive',
                className
            )}
            htmlFor={formItemId}
            {...props}
        />
    );
}

export const FormControl = ({ ...props }: React.ComponentProps<typeof Slot>) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
        <Slot
            data-slot='form-control'
            id={formItemId}
            area-describeby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
}

export const FormDescription = ({ className, ...props }: React.ComponentProps<'p'>) => {
    const { formDescriptionId } = useFormField();

    return (
        <p
            data-slot='form-description'
            id={formDescriptionId}
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export const FormMessage = ({ className, ...props }: React.ComponentProps<'p'>) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? '') : props.children;

    if (!body) {
        return null;
    }

    return (
        <p
            data-slot='form-message'
            id={formMessageId}
            className={cn('text-destructive text-sm', className)}
            {...props}
        >
            {body}
        </p>
    );
}

// // 定义表单值类型
// interface UserForm {
//   name: string;
//   age: number;
//   address: {
//     street: string;
//     city: string;
//   };
// }

// // 创建字段上下文
// const fieldContext: FormFieldContextValue<UserForm> = {
//   name: "name" // 有效：顶级字段
// };

// const nestedFieldContext: FormFieldContextValue<UserForm> = {
//   name: "address.street" // 有效：嵌套字段
// }; 