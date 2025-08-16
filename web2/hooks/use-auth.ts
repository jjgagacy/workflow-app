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
    const [accessToken, setAccessToken] = useState<string>(() =>
        getSessionData('session:token', { access_token: '' }).access_token
    );
    const [routes, setRoutes] = useState<any[]>(() =>
        getSessionData('session:routes', [])
    );
    const [user, setUser] = useState<{
        name: string;
        roles: string[];
        is_super: boolean;
    }>(() =>
        getSessionData('session:userinfo', { name: '', roles: [], is_super: false })
    );

    // 登录方法
    const login = useCallback((
        access_token: string,
        name: string,
        roles: string[],
        is_super: boolean
    ) => {
        const userInfo = { name, roles, is_super };
        const tokenData = { access_token };

        localStorage.setItem("session:token", JSON.stringify(tokenData));
        localStorage.setItem("session:userinfo", JSON.stringify(userInfo));

        setIsAuthenticated(true);
        setUser({ name, roles, is_super });
        setAccessToken(access_token);
    }, []);

    // 登出方法
    const logout = useCallback(() => {
        ["session:token", "session:userinfo", "session:routes"].forEach(key => {
            localStorage.removeItem(key);
        });
        setIsAuthenticated(false);
        setUser({ name: '', roles: [], is_super: false });
        setAccessToken('');
        setRoutes([]);
    }, []);

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
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 辅助方法
    const getUserName = useCallback(() => user.name, [user]);
    const getRoles = useCallback(() => [...user.roles], [user]); // 返回副本避免外部修改
    const isSuper = useCallback(() => user.is_super, [user]);
    const removeToken = useCallback(() => {
        setAccessToken('');
        localStorage.removeItem('session:token');
    }, []);

    return {
        isAuthenticated,
        login,
        logout,
        user,
        getUserName,
        accessToken,
        routes,
        getRoles,
        removeToken,
        isSuper,
    };
}