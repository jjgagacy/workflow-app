export type Account = {
  id: number;
  username: string;
  realName: string;
  email: string;
  mobile: string;
  status: number;
  created_at: string;
  created_by: string;
  roles?: string[];
  roleKeys?: string[];
  last_ip?: string;
}
