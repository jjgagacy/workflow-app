import { Module, ModulePerm } from "@/features/module/components/data";

export type Menu = {
  id: number;
  key: string;
  name: string;
  parent: string;
  status: number;
  sort: number;
  module?: Module;
  modulePerm?: ModulePerm[];
  scope?: Scope[];
  children?: Menu[];
}

export type Scope = {
  key: string;
  name: string;
}
