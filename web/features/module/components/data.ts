export type Module = {
    id: number;
    key: string;
    name: string;
    perms?: ModulePerm[];
}

export type ModulePerm = {
    key: string;
    name: string;
    restrictLevel: number;
}
