'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
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
        <Card className='mx-auto w-full'>
            <CardHeader>
                <CardTitle className="text-left text-2xl font-bold">
                    {pageTitle}
                </CardTitle>
            </CardHeader>
            <CardContent>
                content
            </CardContent>
        </Card>
    );
}