export type Department = {
  id: number;
  key: string;
  name: string;
  parent: string;
  remarks: string;
  managerId: number;
  children?: Department[];
};
