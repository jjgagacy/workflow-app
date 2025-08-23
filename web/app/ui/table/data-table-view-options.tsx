'use client';

import Button from '@/app/components/base/button';
import { cn } from '@/utils/classnames';
import { Menu, MenuButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { IconCaretUpDown, IconCheck, IconFilter, IconSettings, IconSettings2 } from '@tabler/icons-react';
import { Table } from '@tanstack/react-table';
import * as React from 'react';

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>;
}

export function DataTableViewOptions<TData>({
    table
}: DataTableViewOptionsProps<TData>) {
    const columns = React.useMemo(
        () => 
            table.getAllColumns()
            .filter(
                (column) =>
                        typeof column.accessorFn !== 'undefined' && column.getCanHide()
            ),
        [table]
    );

    return (
        <Popover as="div" className="relative">
            <PopoverButton
                as='div'
                aria-label='Toggle columns'
                role='combobox'
                className={'ml-auto hidden h-8 lg:flex'}
            >
                <Button
                    variant={'ghost'}
                    className='flex justify-between items-center gap-2  whitespace-nowrap p-0 border-[var(--border)]'
                >
                    <IconFilter className='text-gray-400 dark:text-gray-900 size-5' />
                    <span>View</span>
                </Button>
            </PopoverButton>
            <PopoverPanel anchor={{ to: 'bottom', gap: '4px'}} className={'flex flex-col bg-background z-50 divide-y divide-[var(--border)] rounded-md transition duration-200 [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-0 border border-[var(--border)]'}>
                {columns.map(column => (
                    <div 
                        key={column.id} 
                        className='flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-default select-none'
                        onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                        <span className='truncate'>
                            {column.columnDef.meta?.label ?? column.id}
                        </span>
                        <IconCheck
                            className={cn(
                                'ml-auto size-4 shrink-0',
                                column.getIsVisible() ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    </div>
                ))}
            </PopoverPanel>
        </Popover>
    );
}