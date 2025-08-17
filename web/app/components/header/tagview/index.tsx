'use client';

import { TagItem, useTagsView } from "@/hooks/use-tagview";
import { Route } from "@/types/route";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface Tag {
    path: string;
    title: string;
    closable: boolean;
}

interface TagViewProps {
    dispatch?: React.Dispatch<any>,
    routes: Route[];
    aliveList: TagItem[];
}

export function TagView({ routes, dispatch, aliveList }: TagViewProps) {
    const router = useRouter();
    const [tags, setTags] = useState<Tag[]>([]);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    // 使用自定义 Hook
    const { addTag, removeTag, include } = useTagsView();

    const deleteKeepAlive = useCallback((key: string) => {
        removeTag(key);
    }, [removeTag]);

    const closeTag = useCallback((path: string) => {
        setTags(prev => {
            const newTags = prev.filter(tag => tag.path !== path);

            // Remove KeepAlive cache
            removeTag(path);

            // Navigate if closing the active tag
            if (activeTag === path) {
                const targetPath = newTags.length > 0 ?
                    newTags[newTags.length - 1].path :
                    "/admin";
                router.push(targetPath);
            }

            return newTags;
        });
    }, [activeTag, router]);

    const navigateToTag = useCallback((path: string) => {
        setActiveTag(path);
        router.push(path);
    }, [router]);

    useEffect(() => {
        setTags(aliveList.map(tagItem => ({
            path: tagItem.path,
            title: tagItem.name,
            closable: true,
        } as Tag)));

        const activeTag = aliveList.find((alive) => alive.active);
        if (activeTag) {
            setActiveTag(activeTag.path);
        }
    }, [aliveList]);

    return (
        <div className="tagview__container w-full overflow-x-auto sticky top-0 z-50 transition-all">
            <div className="tagview__tags">
                {tags.map((tag) => (
                    <div
                        key={tag.path}
                        className={`tagview__tag ${activeTag === tag.path ? "active" : ""}`}
                        onClick={() => navigateToTag(tag.path)}
                    >
                        <span className="tagview__tag-link">
                            {tag.title}
                        </span>
                        {tag.closable && (
                            <span
                                className="tagview__close-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTag(tag.path);
                                }}
                            >×</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
