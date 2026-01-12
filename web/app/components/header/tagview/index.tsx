'use client';

import { useTagsViewStore } from "@/hooks/use-tagview-store";
import { Route } from "@/types/route";
import { findMatchingRoute } from "@/utils/menu";
import { treeToFlatten } from "@/utils/trees";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface Tag {
  key: string;
  path: string;
  title: string;
  closable: boolean;
}

interface TagViewProps {
  dispatch?: React.Dispatch<any>,
  routes: Route[];
}

export function TagView({ routes }: TagViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  // 使用自定义 Hook
  const { tags: aliveList, addTag, removeTag, include } = useTagsViewStore();
  // 直接从 store 派生 tags 和 activeTag
  const tags = useMemo(() =>
    aliveList.map(tagItem => ({
      key: tagItem.key,
      path: tagItem.path,
      title: tagItem.name,
      closable: true,
    })),
    [aliveList]
  );

  const activeTag = useMemo(() =>
    aliveList.find(tag => tag.active)?.key || null,
    [aliveList]
  );

  const closeTag = useCallback((key: string) => {
    removeTag(key);

    if (activeTag === key) {
      const remainingPaths = aliveList
        .filter(tag => tag.key !== key)
        .map(tag => tag.path);
      const targetPath = remainingPaths.length > 0 ? remainingPaths[remainingPaths.length - 1] : "/admin";
      router.push(targetPath);
    }
  }, [activeTag, router, removeTag, aliveList]);

  const navigateToTag = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  useEffect(() => {
    // 初始化时添加当前路由到标签视图
    const currentPath = pathname;
    const matchedRoute = findMatchingRoute(routes, currentPath);

    if (matchedRoute && !include.includes(matchedRoute.key)) {
      addTag({
        key: matchedRoute.key,
        name: matchedRoute.title,
        path: matchedRoute.path,
      });
    }
  }, [aliveList, addTag, router, pathname]);

  return (
    <div className="tagview__container w-full overflow-x-auto sticky top-0 z-40 transition-all">
      <div className="tagview__tags">
        {tags.map((tag) => (
          <div
            key={tag.path}
            className={`tagview__tag ${activeTag === tag.key ? "active" : ""}`}
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
                  closeTag(tag.key);
                }}
              >×</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
