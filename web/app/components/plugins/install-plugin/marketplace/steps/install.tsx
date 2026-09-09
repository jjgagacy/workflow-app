import Card from "../../../card";
import { Plugin } from "../../../types";

type InstallProps = {
  identifier: string;
  manifest: Plugin;
  onCancel: () => void;
  onStartToInstall?: () => void;
  onInstalled?: (plugin: Plugin) => void;
  onFailed?: (message: string) => void;
}
const Install = ({
  manifest,
}: InstallProps) => {
  return (
    <>
      <div className='flex flex-wrap content-start items-start gap-1 self-stretch border border-[var(--border)] rounded-2xl p-2'>
        <Card
          className="w-full"
          plugin={manifest}
          hideInstall
        />
      </div>
    </>
  );
}

export default Install;