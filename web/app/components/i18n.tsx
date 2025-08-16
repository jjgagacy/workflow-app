'use client';

import type { FC } from 'react';
import { Locale, setClientLocale } from '@/i18n';
import React, { useEffect, useState } from 'react';
import Loading from './base/loading';
import I18nContext from '@/context/i18n';

export type I18nProps = {
    locale: Locale;
    children: React.ReactNode;
}

const I18n: FC<I18nProps> = ({locale, children}) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setClientLocale(locale, false).then(() => {
            setLoading(false);
        })
    }, [locale]);

    if (loading) {
        return <div className='flex h-screen w-screen items-center justify-center'><Loading type='app' /></div>
    }

    return (
        <I18nContext.Provider value={{
            locale,
            i18n: {},
            setClientLocale
        }}>
            {children}
        </I18nContext.Provider>
    );
}

export default React.memo(I18n);
