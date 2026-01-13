import { getServerLocale, useTranslation } from "@/i18n/server";
import AccountForm from "./account-form";

type AccountViewPageProps = {
  accountId: string;
}
export default async function AccountViewPage({
  accountId
}: AccountViewPageProps) {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'system');

  const pageTitle = accountId !== 'new' ? t('edit_account') : t('add_account');
  return <AccountForm accountId={accountId} pageTitle={pageTitle} />;
}
