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
    <div className={`flex items-center ${isMobile ? 'hidden' : ''} justify-between space-x-2`}>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {crumbs.map((crumb, index) => (
            <li key={crumb.link} className="flex items-center">
              {index < crumbs.length - 1 ? (
                <>
                  <Link
                    href={crumb.link}
                    className="text-gray-500 hover:text-gray-500"
                  >
                    {crumb.title}
                  </Link>
                  <IconChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                </>
              ) : (
                <span className="text-gray-800 dark:text-gray-400">{crumb.title}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}