'use client';

import Button from "@/app/components/base/button";

export default function Page() {
    return (
        <div>
            <h1>Dashboard</h1>
            <Button variant={'primary'}>primary</Button>
            <Button variant={'secondary'}>secondary</Button>
            <Button variant={'warning'}>warning</Button>
            <Button variant={'tertiary'}>tertiary</Button>
            <Button variant={'ghost'}>ghost</Button>
        </div>
    );
}