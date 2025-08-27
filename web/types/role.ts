export type Role = {
    id: number;
    key: string;
    name: string;
    parent: string;
    rolePerm?: string[];
    status: number;
}
