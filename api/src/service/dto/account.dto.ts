import { AccountStatus } from "@/account/account.enums";
import { IsNotEmpty } from "class-validator";

export class AccountSignUpDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    email: string;
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    name: string;
    password?: string;
    openId?: string;
    provider?: string;
    language?: string;
    status?: AccountStatus;
    theme? = 'light';
    createWorkspaceRequired = true;
}