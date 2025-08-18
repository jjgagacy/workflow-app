'use client';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { IconBell, IconChevronDown, IconLogout, IconUser, IconUserCog } from "@tabler/icons-react";
import { Breadcrumbs } from "./breadcrumbs";
import { Route } from "@/types/route";

interface NavbarProps {
    routes: Route[];
}

export function Navbar({ routes }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/login');
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-[3rem]">
                {/* Left navigation (optional) */}
                <div className="flex flex-1 items-center">
                    <Breadcrumbs routes={routes} />
                </div>

                {/* Right user info */}
                <div className="flex items-center">
                    {/* Notification bell */}
                    <button
                        type="button"
                        className="p-1 mr-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <span className="sr-only">View notifications</span>
                        <IconBell className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {/* User dropdown */}
                    <Menu as="div" className="relative">
                        <MenuButton className="flex items-center space-x-2 max-w-xs rounded-full focus:outline-none">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="用户头像"
                                    className="h-8 w-8 rounded-full"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                                {user?.name || "未登录"}
                            </span>
                            <IconChevronDown
                                className="h-4 w-4 text-gray-500"
                                aria-hidden="true"
                            />
                        </MenuButton>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <MenuItems className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 focus:outline-none z-100">
                                <MenuItem>
                                    {() => (
                                        <button
                                            onClick={() => router.push('/profile')}
                                            className={`flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white`}
                                        >
                                            <IconUser className="mr-2 h-4 w-4" />
                                            个人中心
                                        </button>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {() => (
                                        <button
                                            onClick={() => router.push('/settings')}
                                            className={`flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white`}
                                        >
                                            <IconUserCog className="mr-2 h-4 w-4" />
                                            系统设置
                                        </button>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {() => (
                                        <button
                                            onClick={handleLogout}
                                            className={`flex items-center px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white`}
                                        >
                                            <IconLogout className="mr-2 h-4 w-4" />
                                            退出登录
                                        </button>
                                    )}
                                </MenuItem>
                            </MenuItems>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </div>
    );
}