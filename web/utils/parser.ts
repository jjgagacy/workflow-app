import { ExtendedColumnSort } from "@/app/ui/table/data-table";
import { dataTableConfig } from "@/config/data-table";
import { createParser } from "nuqs";
import * as z from "zod";

const filterItemSchema = z.object({
    id: z.string(),  // 过滤器的唯一标识符
    value: z.union([z.string(), z.array(z.string())]), // 过滤器的值，可以是字符串或字符串数组
    variant: z.enum(dataTableConfig.filterVariants), // 过滤器的类型
    operator: z.enum(dataTableConfig.operators), // 过滤器的操作符
    filterId: z.string()
});

export type FilterItemSchema = z.infer<typeof filterItemSchema>;

const sortingItemSchema = z.object({
    id: z.string(), // 排序的列ID
    desc: z.boolean() // 是否降序
});

// This function returns a custom parser configured to handle the serialization and deserialization of a sorting state array 
// (like [{ id: 'name', desc: false }, { id: 'age', desc: true }]) for a specific table/data structure. 
export const getSortingStateParser = <TData>(
    columnIds?: string[] | Set<string>
) => {
    const validKeys = columnIds
        ? columnIds instanceof Set
            ? columnIds
            : new Set(columnIds)
        : null; // new Set<string>();
    
    return createParser({
        parse: (value) => {
            try {
                const parsed = JSON.parse(value);
                const result = z.array(sortingItemSchema).safeParse(parsed);

                if (!result.success) return null;

                if (validKeys && result.data.some(item => !validKeys.has(item.id))) {
                    return null; // 如果有无效的列ID，返回null
                }

                return result.data as ExtendedColumnSort<TData>[];
            } catch {
                return null;
            }
        },
        serialize: (value) => JSON.stringify(value),
        eq: (a, b) => // Purpose: Tells nuqs how to check if two state values are equal
            a.length === b.length &&
            a.every((item, index) => item.id === b[index].id && item.desc === b[index].desc)
    });
}

