'use client';

import { TagsViewMax } from "@/hooks/use-tagview";
import { useUpdate } from "@/hooks/use-update";
import React, { cloneElement, isValidElement, memo, ReactElement, ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface KeepAliveProps {
    active?: string | null;
    children: ReactNode;
    exclude?: string[];
    include?: string[];
    isAsyncInclude?: boolean;
}

interface CachedComponent {
    name: string;
    node: any;
    idx: number;
    active: boolean;
}

function KeepAliveComponent({ active, children, name, renderDiv }: {
  active: boolean;
  children: ReactNode;
  name: string;
  renderDiv: React.RefObject<HTMLDivElement | null>;
}) {
    const [targetElement] = useState(() => document.createElement('div'));
    const activateRef = useRef(false);
    activateRef.current = activateRef.current || active;
// console.log(active, name, targetElement, '**');
    useEffect(() => {
        if (active) {
            if (renderDiv.current) {
                renderDiv.current.appendChild(targetElement);
            }
        } else {
            try {
                if (renderDiv.current && targetElement.parentNode === renderDiv.current) {
                    console.log('remove child', name);
                    renderDiv.current.removeChild(targetElement);
                }
            } catch (e) {
                console.error('Error removing child:', e);
            }
        }
    }, [active, name, renderDiv, targetElement]);

    useEffect(() => {
        targetElement.setAttribute('id', name);
    }, [name, targetElement]);

    return (
        <>
            {activateRef.current && createPortal(children, targetElement)}
        </>
    );
}

function KeepAlive({ active, children, exclude, include, isAsyncInclude = false }: KeepAliveProps) {
    const maxLen = TagsViewMax;
    const container = useRef<HTMLDivElement>(null);
    const components = useRef<CachedComponent[]>([]);
    const [asyncInclude] = useState(isAsyncInclude);
    const update = useUpdate();
// console.log(active, '-------------');
    useLayoutEffect(() => {
        const activeComponent = components.current.find(com => com.active);
        if (activeComponent) {
            if (activeComponent.name != active) {
                // console.log(React.isValidElement(activeComponent.node), '*');
                console.log('clone node', activeComponent.name, '*********');
                activeComponent.node = React.cloneElement(activeComponent.node as ReactElement, { key: activeComponent.name });
            }
        }
        // console.log(active, activeComponent, '^^^^^^^^^^^^^^');
        if (active === undefined || active === null) {
            return;
        }
        // Manage cache size
        if (components.current.length >= maxLen) {
            components.current = components.current.slice(1);
        }
        const component = components.current.find((com) => com.name === active);
        console.log(active, component === undefined ? 'not find' : 'founed', '*****************');
        if (component === undefined) {
            if (isValidElement(children)) {
                const componentData = cloneElement(children);
                const component: any = componentData.type;
                const MemoComponent = memo(component);
                console.log(active, children, '++++++++')
                components.current = [
                    ...components.current,
                    {
                        name: active,
                        node: componentData,
                        idx: 1,
                        active: true,
                    }
                ];
            } else {
                console.error('KeepAlive children must be a valid React element');
            }
            
            if (!asyncInclude) {
                update();
            }
        } else {
            console.log(active, component.idx, 'aaaaaaaaaa')
            component.active = true;
            component.idx++;
        }
        return () => {
            if (
                (exclude === undefined || exclude === null) &&
                (include === undefined || include === null)
            ) {
                return;
            }
 
            // components.current = components.current.filter(({ name }) => {
            //     if (exclude && exclude.includes(name)) {
            //         return false;
            //     }
            //     if (include) {
            //         return include.includes(name);
            //     }
            //     return true;
            // });
            // console.log(components.current, 'cccccccccccccc');
        };

    }, [children, active, exclude, include, update, asyncInclude, maxLen]);

    // console.log(components.current, '!!')
    return (
        <div ref={container} className="keep-alive">
            {components.current.map(({ name, node, idx }) => (
                <KeepAliveComponent
                    key={name}
                    active={name === active}
                    name={name}
                    renderDiv={container}
                >
                    <i>{idx}</i>
                    {node}
                </KeepAliveComponent>
            ))}
        </div>
    );
}

export default memo(KeepAlive);
