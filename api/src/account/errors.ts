import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AccountRole, MemberAction } from "./account.enums";

export class InvalidActionError extends BadRequestException {
    constructor(action: string) {
        super(`Invalid action: ${action}`);
    }
}

export class NoPermissionError extends ForbiddenException {
    constructor(action: string, tenantName?: string) {
        const message = tenantName
            ? `No permission to ${action} member in tenant ${tenantName}`
            : `No permission to ${action}`;
        super(message);
    }
}

export const permissionMap: Record<MemberAction, AccountRole[]> = {
    [MemberAction.ADD]: [AccountRole.OWNER, AccountRole.ADMIN],
    [MemberAction.REMOVE]: [AccountRole.OWNER],
    [MemberAction.UPDATE]: [AccountRole.OWNER],
};

export class MemberNotInTenantError extends NotFoundException {
    constructor(member: string, tenantName: string) {
        super(`Member ${member} is not in tenant ${tenantName}`);
    }
}

export class RoleAlreadyAssignedError extends ConflictException {
    constructor(member: string, role: AccountRole) {
        super(`Role ${role} already assigned to member ${member}`);
    }
}