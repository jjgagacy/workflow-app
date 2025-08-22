import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { IconChevronDown } from '@tabler/icons-react';
import { ReactNode } from 'react';

// 定义单个面板项的类型
interface AccordionItemProps {
  title: string;
  description: ReactNode;
  defaultOpen?: boolean;
}

// 定义整个面板组件的props类型
interface AccordionProps {
  items: AccordionItemProps[];
  className?: string;
}

// 单个面板项组件
const AccordionItem = ({ title, description, defaultOpen = false }: AccordionItemProps) => {
  return (
    <Disclosure as="div" className="p-6 border-b border-[var(--border)]" defaultOpen={defaultOpen}>
      <DisclosureButton className="group flex w-full items-center justify-between">
        <span className="text-left text-sm/6 font-medium group-data-hover:text-primary/90">
          {title}
        </span>
        <IconChevronDown className="size-5 group-data-hover:fill-white/50 group-data-open:rotate-180 transition-transform duration-200" />
      </DisclosureButton>
      <DisclosurePanel className="mt-2 text-sm/5">
        {description}
      </DisclosurePanel>
    </Disclosure>
  );
};

// 面板容器组件
export const Accordion = ({ items, className = '' }: AccordionProps) => {
  return (
    <div className={`w-full divide-y divide-white/10 rounded-xl bg-background backdrop-blur-sm ${className}`}>
      {items.map((item, index) => (
        <AccordionItem 
          key={index}
          title={item.title}
          description={item.description}
          defaultOpen={item.defaultOpen}
        />
      ))}
    </div>
  );
};
