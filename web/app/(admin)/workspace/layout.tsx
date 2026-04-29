import { ContentContainer } from "@/app/components/layout/page-container";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ContentContainer>
      {children}
    </ContentContainer>
  );
}
