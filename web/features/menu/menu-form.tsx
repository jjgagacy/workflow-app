'use client';

import usePageTitle from "@/hooks/use-page-title";
import { useState } from "react";
import { Menu } from "./components/data";
import api from "@/api";
import { useRouter } from "next/navigation";

export default function MenuForm({
    menuId,
    pageTitle
}: {
    menuId: number;
    pageTitle: string;
}) {
    usePageTitle(pageTitle);
    const [isLoading, setIsLoading] = useState(false);
    const [updateMenuId] = useState<number>(menuId);
    const [parentMenus, setParentMenus] = useState<Menu[]>();
    const updateMenu = api.menu.useUpdateMenu();
    const createMenu = api.menu.useCreateMenu();
    const router = useRouter();
    let menu: Menu | null = null;


    return (

    );
}