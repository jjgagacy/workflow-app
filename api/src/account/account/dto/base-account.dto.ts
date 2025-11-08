export abstract class BaseAccountDto {
    id?: number;
    realName?: string;
    email?: string;
    mobile?: string;
    avatar?: string;
    status?: number;
    roles?: number[];
    language?: string;
    theme?: string;
}
