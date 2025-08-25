'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import usePageTitle from "@/hooks/use-page-title";
import z from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import Button from "@/app/components/base/button";

const formSchema = z.object({
    username: z.string().min(2, {
        error: '账户名至少需要2个字符'
    }),
    password: z.string().min(4, {
        error: '密码至少需要4个字符',
    }),
    realName: z.string(),
    mobile: z.string(),
    email: z.email(),
    roles: z.array(z.string()).min(1, {
        error: '至少选择一个角色',
    }),
    status: z.int(),
});

export default function AccountForm({
    accountId,
    pageTitle
}: {
    accountId: string,
    pageTitle: string
}) {
    usePageTitle(pageTitle);

    // todo: accountId 
    const defaultValues: z.infer<typeof formSchema> = {
        username: '',
        password: '',
        realName: '',
        mobile: '',
        email: '',
        roles: [],
        status: 0
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: defaultValues,
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <Card className='mx-auto w-full'>
            <CardHeader>
                <CardTitle className="text-left text-2xl font-bold">
                    {pageTitle}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                         <div className="grid grid-cols-12 gap-4 mb-8">
                            <div className="col-span-6 p-4 space-y-4 rounded">

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>账户名</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (

                                    )}
                                /> */}

                            </div>
                            <div className="col-span-6 p-4 space-y-4 rounded">

                            </div>
                        </div>

                        <Button className="ml-4" type="submit">添加账户</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}