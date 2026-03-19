import { useTranslation } from "react-i18next";
import { Plugin } from "../../types";
import Card from "../../card";
import { Button } from "@/app/components/base/button";

type InstalledProps = {
  manifest: Plugin;
  isFailed: boolean;
  errorMessage?: string;
  onClose?: () => void;
}

const Installed = ({
  manifest,
  isFailed,
  errorMessage,
  onClose
}: InstalledProps) => {
  const { t } = useTranslation();

  return (
    <>
      {errorMessage && <p className="mb-2">{errorMessage}</p>}
      <div className='flex flex-wrap content-start items-start gap-1 self-stretch border border-[var(--border)] rounded-2xl p-2'>
        <Card
          className="w-full"
          plugin={manifest}
          hideInstall
        />
      </div>
      <div className='flex items-center justify-end gap-2 self-stretch pt-6 pb-6'>
        <Button
          variant={'primary'}
          onClick={onClose}
        >
          {t('app.actions.close')}
        </Button>
      </div>
    </>
  );
}

export default Installed;