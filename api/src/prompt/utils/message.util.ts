import { PromptMessageRole } from "../enums/prompt-message.enum";

export class PromptMessageRoleUtil {
    static valueOf(value: string): PromptMessageRole {
        for (const role of Object.values(PromptMessageRole)) {
            if (role === value) {
                return role;
            }
        }
        throw new Error(`Invalid prompt message role value: ${value}`);
    }
}