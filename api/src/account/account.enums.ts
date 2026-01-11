import { EnumUtils } from "@/common/utils/enums"

export enum AccountStatus {
  ACTIVE = 0,
  BANNED = 1,
  UNINITIALIZED = 2,
  CLOSED = 3,
}

export const getAccountStatusText = (accountStatus: number): string => {
  const statusKey = EnumUtils.getKeySafe(AccountStatus, accountStatus);
  return statusKey ? statusKey : 'Unknown status';
}

export enum AccountRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor'
}

export enum MemberAction {
  ADD = 'add',
  REMOVE = 'remove',
  UPDATE = 'update',
}
