import { ComponentType } from 'react';

export interface CascadeFilterValue {
  type: string;
  operator: string;
}

export interface CascadeFilterOption {
  key: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  operators: string[];
}