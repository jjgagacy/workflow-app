'use client';

import { Route } from "@/types/route";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { useBreadcrumbs } from "../../hooks/use-breadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile";

interface BreadcrumbsProps {
  routes: Route[];
}

export function Breadcrumbs({ routes }: BreadcrumbsProps) {
  const crumbs = useBreadcrumbs(routes);
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center ${isMobile ? 'hidden' : ''} justify-between space-x-1`}>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          {crumbs.map((crumb, index) => (
            <li key={crumb.link} className="flex items-center">
              {index < crumbs.length - 1 ? (
                <>
                  <Link
                    href={crumb.link}
                    className="text-gray-400 hover:text-gray-400 text-sm"
                  >
                    {crumb.title}
                  </Link>
                  <IconChevronRight className="mx-1 h-2 w-2 text-gray-400" />
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-500 text-sm">{crumb.title}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}