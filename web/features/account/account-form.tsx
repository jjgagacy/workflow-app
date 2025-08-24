'use client';

import usePageTitle from "@/hooks/use-page-title";

export default function AccountForm({
    accountId,
    pageTitle
}: {
    accountId: string,
    pageTitle: string
}) {
    usePageTitle(pageTitle);

    return (
        <div className='mx-auto w-full'>
            {accountId}
        </div>
    );
}