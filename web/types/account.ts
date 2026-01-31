export type AccountInfo = {
  id: string;
  email: string;
  username: string;
  mobile: string;
  avatar: string;
  isSuper: boolean;
  roles: string[];
  created_at?: string;
  theme?: string;
  appearance?: string;
  timezone?: string;
  language?: string;
}
