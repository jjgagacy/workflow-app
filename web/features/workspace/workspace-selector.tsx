'use client';

import api from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkspaceSelector() {
  const { logout, setCurrentTenant } = useAuth();
  const router = useRouter();
  const currentTenantMutation = api.account.useCurrentTenant();

  useEffect(() => {
    (async () => {
      try {
        const tenantInfo = await currentTenantMutation({});
        if (!tenantInfo?.tenant_id) {
          logout();
          router.push('/login');
          return;
        }
        setCurrentTenant(tenantInfo);
        router.push('/admin');
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
        // 处理错误，比如跳转到错误页面或显示错误信息
        logout();
        router.push('/login');
      }
    })();
  }, []);

  return (
    <></>
  );
}