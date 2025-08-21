'use client';

import { cn } from "@/utils/classnames";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Listbox } from "@headlessui/react";
import { IconCheck, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useEffect, useRef, useState, type FC } from "react";

export type Item = {
    value: number | string;
    name: string;
} & Record<string, any>;

export type ISelectProps = {
    className?: string;
    items?: Item[];
    defaultValue?: number | string;
    onSelect?: (value: Item) => void;
    allowSearch?: boolean;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
    overlayClassName?: string;
    optionWrapClassName?: string;
    optionClassName?: string;
    byClassName?: string;
    renderOption?: ({item, selected}: { item: Item, selected: boolean}) => React.ReactNode;
}

export const Select: FC<ISelectProps> = ({ 
    className,
    items,
    disabled,
    onSelect,
    allowSearch = true,
    placeholder = '请选择',
    overlayClassName,
    optionWrapClassName,
    optionClassName,
    byClassName,
    renderOption,
    defaultValue
}) => {
    // 不能有open状态，让Combox自动管理
    const [query, setQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    useEffect(() => {
        const existed = items?.find(i => i.value === defaultValue) || null;
        if (existed) {
            setSelectedItem(existed);
        }
    }, [defaultValue]);

    const filterItems: Item[] = query === '' ? (items || []) : (items || []).filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <Combobox
            as={'div'}
            disabled={disabled}
            value={selectedItem}
            onChange={(item) => {
                if (!disabled) {
                    setSelectedItem(item);
                    if (item !== null) {
                        onSelect?.(item);
                    }
                }
            }}
            className={`relative ${className || ''}`}
        >
            {({ open }) => (
                <>
                    {allowSearch ?
                        <ComboboxInput
                            className={cn('w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-s',
                                disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-background',
                                optionClassName
                            )}
                            displayValue={(item: Item) => item?.name}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                        /> :
                        <ComboboxButton
                            className={cn(
                                'w-full border border-[var(--border)] rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-left',
                                disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-background',
                                byClassName
                            )}
                        >
                            <div className='grow truncate text-left' title={selectedItem?.name}>{selectedItem ? selectedItem.name : placeholder}</div>
                        </ComboboxButton>
                    }
                    <ComboboxButton
                        className={cn('absolute inset-y-0 right-0 flex items-center pr-2', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
                    >
                        {open ? <IconChevronUp className="h-5 w-5 text-gray-500" /> : <IconChevronDown className="h-5 w-5 text-gray-500 rotate-180" />}
                    </ComboboxButton>

                    {(filterItems.length > 0 && open) && (
                        <>
                            <ComboboxOptions className={cn('absolute z-10 mt-1 w-full border border-[var(--border)] rounded-md max-h-60 overflow-auto focus:outline-none', overlayClassName)}>
                                {filterItems.map((item) => (
                                    <ComboboxOption
                                        key={item.value}
                                        value={item}
                                        className={({ active, selected }: { active: boolean, selected: boolean }) => cn(
                                            'cursor-pointer select-none relative py-2 pl-3 pr-9 bg-white dark:bg-gray-800 hover:bg-selection-hover',
                                            active ? 'bg-selection-hover' : '',
                                            selected ? 'font-semibold' : 'font-normal',
                                            optionWrapClassName
                                        )}
                                    >
                                        {({ selected }) => (
                                            <>
                                                {renderOption ? renderOption({ item, selected }) : (
                                                    <span className={cn('block truncate', selected ? 'font-semibold' : 'font-normal')}>{item.name}</span>
                                                )}
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                                        <IconCheck className="h-5 w-5" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </>
                    )}
                </>
            )}
        </Combobox>
    );
}

