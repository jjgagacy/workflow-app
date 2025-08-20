'use client';

import Button from "@/app/components/base/button";
import { Dialog } from "@/app/ui/dialog";
import { toast } from "@/app/ui/toast";
import { useState } from "react";

export default function Page() {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <div>
            <h1 className="mt-4">Dashboard</h1>
            <div className="flex gap-2">
                <Button variant={'primary'}>primary</Button>
                <Button variant={'secondary'}>secondary</Button>
                <Button variant={'warning'}>warning</Button>
                <Button variant={'tertiary'}>tertiary</Button>
                <Button variant={'ghost'}>ghost</Button>
            </div>

            <h1 className="mt-4">toasters</h1>
            <div className="flex gap-2">
                <Button variant={'secondary'} onClick={() => toast.message('this is a message')}>message</Button>
                <Button variant={'secondary'} onClick={() => toast.info('this is a info message')}>info</Button>
                <Button variant={'secondary'} onClick={() => toast.success('this is a success message')}>success</Button>
                <Button variant={'secondary'} onClick={() => toast.warning('this is a warning message')}>warning</Button>
                <Button variant={'secondary'} onClick={() => toast.error('this is an error message')}>error</Button>
                <Button variant={'secondary'} onClick={() => { toast.loading(); setTimeout(() => toast.dismiss(), 3000); }}>loading</Button>
            </div>
            
            <h1 className="mt-4">dialog</h1>
            <Button variant={'secondary'} onClick={() => setShowDialog(true)}>show dialog</Button>


            <Dialog
                isOpen={showDialog}
                isLoading={false}
                title={'this is title data'}
                description=""
                confirmText="确定"
                cancelText="取消"
                onConfirm={() => 1}
                onCancel={() => setShowDialog(false)}
            >
                this is content dialog
            </Dialog>
        </div>
    );
}