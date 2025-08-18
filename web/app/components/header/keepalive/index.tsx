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
    useEffect(() => {
        if (active) {
            if (renderDiv.current) {
                renderDiv.current.appendChild(targetElement);
            }
        } else {
            try {
                if (renderDiv.current && targetElement.parentNode === renderDiv.current) {
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
    useLayoutEffect(() => {
        if (active === undefined || active === null) {
            return;
        }
        // Manage cache size
        if (components.current.length >= maxLen) {
            components.current = components.current.slice(1);
        }
        const component = components.current.find((com) => com.name === active);
        if (component === undefined) {
            if (isValidElement(children)) {
                const componentData = cloneElement(children);
                components.current = [
                    ...components.current,
                    {
                        name: active,
                        node: componentData,
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
            component.active = true;
        }
        return () => {
            if (
                (exclude === undefined || exclude === null) &&
                (include === undefined || include === null)
            ) {
                return;
            }
 
            components.current = components.current.filter(({ name }) => {
                if (exclude && exclude.includes(name)) {
                    return false;
                }
                if (include) {
                    return include.includes(name);
                }
                return true;
            });
        };

    }, [children, active, exclude, include, update, asyncInclude, maxLen]);

    return (
        <div ref={container} className="keep-alive">
            {components.current.map(({ name, node }) => (
                <KeepAliveComponent
                    key={name}
                    active={name === active}
                    name={name}
                    renderDiv={container}
                >
                    {node}
                </KeepAliveComponent>
            ))}
        </div>
    );
}

export default memo(KeepAlive);
