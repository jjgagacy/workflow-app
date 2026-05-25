'use client';

import { WorkflowApp } from '@/app/components/workflow-app';

export const Page = () => {
  return (
    <div className='flex-1 grow bg-background relative shadow-md border-t border-[var(--border)]'>
      <div id="react-flow" className='w-full h-full overflow-x-auto'>
        <WorkflowApp />
      </div>
    </div>
  );
};

export default Page;