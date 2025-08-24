'use client';

import { ErrorAlert, WarningAlert } from "@/app/components/base/alert";
import Button from "@/app/components/base/button";
import { useAuth } from "@/hooks/use-auth";
import usePageTitle from "@/hooks/use-page-title";
import { getServerLocale } from "@/i18n/server";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { IconLock, IconMail } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api";
import { getErrorMessage } from "@/utils/errors";

export default function Page() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const [error, setError] = useState("");
    const { t } = useTranslation();
    const router = useRouter();
    const loginMutation = api.user.useLogin();

    usePageTitle(t('login.login_title'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await loginMutation(name, password);
            const { access_token, name: userName, roles, isSuper } = result;
            login(access_token, userName, roles, isSuper);
            setIsLoading(false);
            setError("");
            router.push('/admin');
        } catch (err: any) {
            setError(getErrorMessage(err));
            setIsLoading(false);
        }
    }

    return (
        <>
            {error !== '' && <ErrorAlert message={error} />}

            {/* Title */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold ">欢迎回来</h1>
                <p className="text-gray-500 mt-2">请输入您的账号信息登录</p>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Username Input */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                        账号
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="your account"
                            required
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                        密码
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-white">记住我</span>
                    </label>
                </div>

                <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                >
                    忘记密码?
                </Link>

                {/* Login Button */}
                <Button 
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                    className="w-full shadow"
                    variant={'primary'}
                    size={'large'}
                >登录</Button>
            </form>
        </>
    );
}
