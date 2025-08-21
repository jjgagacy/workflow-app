'use client';

import Button from "@/app/components/base/button";
import { useDialog } from "@/app/components/hooks/use-dialog";
import { Dialog } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { Select } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { toast } from "@/app/ui/toast";
import { TreeNode, TreeSelect } from "@/app/ui/tree-select";
import { arrayToTree, treeToFlatten } from "@/utils/trees";
import { useState } from "react";

export default function Page() {
    const [openDialog, setOpenDialog] = useState(false);
    const { showDialog, showAlert, showConfirm } = useDialog();

    const handleDelete = async () => {
        // use dialog
        const confirmed = await showDialog({
            title: "确认删除",
            description: "您确定要删除此项吗？此操作不可撤销。",
            confirmText: "删除",
            cancelText: "取消",
            destructive: true,
            onConfirm: async () => {
            }
        });

        if (confirmed) {
            console.log('Item deleted');
        }
    };

    const handleAlert = async () => {
        await showAlert('确定操作吗');
    }

    const handleConfirm = async () => {
        const confirmed = await showConfirm('确定吗？？？', '修改修改修改');
        if (confirmed) {
            console.log('confirmed');
        }
    }

    const selectItems = [
        { value: 1, name: '选项一' },
        { value: 2, name: '选项二' },
        { value: 3, name: '选项三' },
        { value: 4, name: '选项四' },
        { value: 5, name: '选项五' }
    ];


    const treeData: TreeNode[] = [
        {
            id: 1,
            name: 'Node 1',
            children: [
                {
                    id: 2,
                    name: 'Node 1.1',
                    children: [
                        { id: 3, name: 'Node 1.1.1' }
                    ]
                },
                { id: 4, name: 'Node 1.2' }
            ]
        },
        {
            id: 5,
            name: 'Node 2'
        }
    ];

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
            <div className="flex gap-2">
                <Button variant={'secondary'} onClick={() => setOpenDialog(true)}>show dialog</Button>
                <Button variant={'secondary'} onClick={() => handleDelete()}>show delete dialog</Button>
                <Button variant={'secondary'} onClick={() => handleAlert()}>show alert</Button>
                <Button variant={'secondary'} onClick={() => handleConfirm()}>show confirm</Button>
            </div>

            <h1 className="mt-4">forms</h1>
            <div className="flex flex-col gap-2">
                <Input type="text" placeholder="please input..." />
                <Textarea placeholder="a simple description" />
                <Select items={selectItems} allowSearch={false}></Select>
                <TreeSelect options={treeData} idKey="id" labelKey="name" multiple={true} onChange={(e) => console.log(e)}></TreeSelect>
            </div>

            <Dialog
                isOpen={openDialog}
                isLoading={true}
                title={'this is title data'}
                description=""
                confirmText="确定"
                cancelText="取消"
                onConfirm={() => 1}
                onCancel={() => setOpenDialog(false)}
            >
                this is content dialog
            </Dialog>
        </div>
    );
}