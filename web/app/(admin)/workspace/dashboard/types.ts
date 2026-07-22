import { Type, Hash, Calendar, CheckSquare, List, Box, ChevronRight } from "lucide-react";

export type DataTypeKey = 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';

export interface DataTypeOption {
  key: DataTypeKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  operators: string[];
}

export const FILTER_OPTIONS: DataTypeOption[] = [
  {
    key: 'string',
    name: 'String',
    icon: Type,
    operators: ['exists', 'does not exist', 'is empty', 'is not empty', 'is equal to', 'is not equal to', 'contains']
  },
  {
    key: 'number',
    name: 'Number',
    icon: Hash,
    operators: ['exists', 'does not exist', 'is equal to', 'greater than', 'less than']
  },
  {
    key: 'date',
    name: 'Date & Time',
    icon: Calendar,
    operators: ['exists', 'does not exist', 'is before', 'is after', 'is empty']
  },
  {
    key: 'boolean',
    name: 'Boolean',
    icon: CheckSquare,
    operators: ['is true', 'is false']
  },
  {
    key: 'array',
    name: 'Array',
    icon: List,
    operators: ['contains', 'does not contain', 'is empty', 'length equals']
  },
  {
    key: 'object',
    name: 'Object',
    icon: Box,
    operators: ['exists', 'does not exist', 'has key']
  },
];