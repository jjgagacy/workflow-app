import React from "react"
import I18n from "./i18n"
import { getServerLocale } from "@/i18n/server"

export type I18nServerProps = {
    children: React.ReactNode
}

const I18nServer = async ({ children }: I18nServerProps) => {
    const locale = await getServerLocale();
    return (
        <I18n {...{ locale }}>
            {children}
        </I18n>
    );
}

export default I18nServer;
