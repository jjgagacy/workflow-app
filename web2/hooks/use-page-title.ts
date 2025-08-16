'use client';

import { useTitle } from "ahooks";

export default function usePageTitle(title: string) {
    const prefix = title ? `${title} - ` : '';
    let titleStr = '';
    titleStr = `${prefix}`;
    useTitle(titleStr);
}
