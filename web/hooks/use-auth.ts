import { TenantInfo } from '@/types/tenant';
import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  // 从 localStorage 安全读取并解析数据
  const getSessionData = useCallback((key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error parsing session data for key ${key}:`, error);
      return defaultValue;
    }
  }, []);

  // 初始化状态
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    !!getSessionData('session:token', { access_token: '' }).access_token
  );
  const getAccessToken = () => {
    return getSessionData('session:token', { access_token: '' }).access_token
  }
  const [accessToken, setAccessToken] = useState<string>(() => getAccessToken());
  const [routes, setRoutes] = useState<any[]>(() =>
    getSessionData('session:routes', [])
  );
  const [user, setUser] = useState<{
    name: string;
    roles: string[];
    is_super: boolean;
    avatar?: string | undefined;
  }>(() =>
    getSessionData('session:userinfo', { name: '', roles: [], is_super: false, avatar: undefined })
  );
  const [tenant, setTenant] = useState<TenantInfo>(() => getSessionData('session:tenantInfo', { tenant_id: '', name: '', plan: '' }));

  // 登录方法
  const login = useCallback((
    access_token: string,
    name: string,
    roles: string[],
    is_super: boolean,
    avatar?: string,
  ) => {
    const userInfo = { name, roles, is_super, avatar };
    const tokenData = { access_token };

    localStorage.setItem("session:token", JSON.stringify(tokenData));
    localStorage.setItem("session:userinfo", JSON.stringify(userInfo));

    setIsAuthenticated(true);
    setUser({ name, roles, is_super, avatar });
    setAccessToken(access_token);
  }, [setIsAuthenticated, setUser, setAccessToken]);

  const setCurrentTenant = useCallback((tenantInfo: TenantInfo) => {
    localStorage.setItem("session:tenantInfo", JSON.stringify(tenantInfo));
    setTenant(tenantInfo);
  }, [setTenant]);

  // 登出方法
  const logout = useCallback(() => {
    ["session:token", "session:userinfo", "session:routes", "session:tenantInfo"].forEach(key => {
      localStorage.removeItem(key);
    });
    setIsAuthenticated(false);
    setUser({ name: '', roles: [], is_super: false, avatar: undefined });
    setAccessToken('');
    setRoutes([]);
    setTenant({ tenant_id: '', name: '', plan: '' });
  }, [setIsAuthenticated, setUser, setAccessToken, setRoutes]);

  // 同步状态与 localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session:token') {
        const tokenData = e.newValue ? JSON.parse(e.newValue) : { access_token: '' };
        setAccessToken(tokenData.access_token);
        setIsAuthenticated(!!tokenData.access_token);
      }
      if (e.key === 'session:userinfo') {
        const userInfo = e.newValue ? JSON.parse(e.newValue) : { name: '', roles: [], is_super: false };
        setUser(userInfo);
      }
      if (e.key === 'session:routes') {
        const routesData = e.newValue ? JSON.parse(e.newValue) : [];
        setRoutes(routesData);
      }
      if (e.key == 'session:tenantInfo') {
        const tenantInfo = e.newValue ? JSON.parse(e.newValue) : { tenant_id: '', name: '', plan: '' };
        setTenant(tenantInfo);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 辅助方法
  const getUserName = useCallback(() => user.name, [user]);
  const getRoles = useCallback(() => [...user.roles], [user]); // 返回副本避免外部修改
  const isSuper = useCallback(() => user.is_super, [user]);
  const getUserAvatar = useCallback(() => user.avatar, [user]);
  const getTenantId = useCallback(() => tenant.tenant_id, [tenant]);
  const getCurrentTenant = useCallback(() => tenant, [tenant]);
  const hasTenant = useCallback(() => !!tenant.tenant_id, [tenant]);
  const removeToken = useCallback(() => {
    setAccessToken('');
    localStorage.removeItem('session:token');
  }, [setAccessToken]);


  const isSuperUser = (user: any): boolean => {
    if (!user.roles) return false;

    const roles = Array.isArray(user.roles)
      ? user.roles
      : [user.roles];

    return roles.some((role: any) => {
      const roleName = typeof role === 'string'
        ? role
        : role?.name || '';

      return roleName.toLowerCase() === 'admin';
    });
  }

  const isOwner = (user: any): boolean => {
    return user.isOwner === true;
  }

  return {
    isAuthenticated,
    login,
    logout,
    user,
    getUserName,
    getUserAvatar,
    accessToken,
    getAccessToken,
    routes,
    getRoles,
    removeToken,
    isSuper,
    getTenantId,
    setCurrentTenant,
    getCurrentTenant,
    hasTenant,
    isSuperUser,
    isOwner,
  };
}