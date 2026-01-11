import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AccountRole, MemberAction } from "./account.enums";
import { I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";

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

export class AccountNotLinkTenantError extends NotFoundException {
  constructor(tenantId: string, account: string) {
    super(`Account ${account} is not a member of Tenant ${tenantId} or tenant is not active`);
  }
}

export class CanNotOperateSelfError extends ForbiddenException {
  constructor() {
    super('Cannot operate self');
  }
}

export class WorkspaceExceededError extends ForbiddenException {
  constructor(message: string) {
    super(message);
  }
}