import { getServerLocale, useTranslation } from "@/i18n/server"
import { Metadata } from "next"

type Props = {
  params: { lng: string }
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'app');

  return {
    title: t('title'),
    description: t('description'),
  };
}