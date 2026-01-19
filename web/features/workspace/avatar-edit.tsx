import Avatar from "@/app/components/base/avatar";
import useLocalFileUploader, { ImageFile } from "@/app/components/base/image-uploader/use-image-uploader";
import ImageInput, { ImageInputInfo, OnImageInput } from "@/app/components/base/photo-picker/image-input";
import getCroppedImg from "@/app/components/base/photo-picker/utils";
import { Dialog } from "@/app/ui/dialog";
import { DISABLE_UPLOAD_AVATAR } from "@/config";
import { PencilLine } from "lucide-react";
import { useCallback, useState } from "react";
import { type Area } from "react-easy-crop";
import { useTranslation } from "react-i18next";

interface AvatarEditProps {
  name: string;
  avatar: string | null;
  size?: number;
  className?: string;
  onSave?: () => void;
}


export default function AvatarEdit({ onSave, ...props }: AvatarEditProps) {
  const { t } = useTranslation();
  const [showAvatarPicker, setShowAvatarPicker] = useState(true);

  const [inputImageInfo, setInputImageInfo] = useState<ImageInputInfo>();
  const [uploading, setUploading] = useState(false);

  const handleImageInput: OnImageInput = useCallback(async (isCropped: boolean, fileOrUrl: string | File, areaPixels?: Area, filename?: string) => {
    setInputImageInfo(
      isCropped
        ? { tempUrl: fileOrUrl as string, areaPixels: areaPixels!, filename: filename! }
        : { file: fileOrUrl as File }
    )
  }, [setInputImageInfo]);

  const handleSaveAvatar = useCallback(async (uploadFileId: string) => {
    // TODO: post to server

  }, [onSave, t]);

  const { handleLocalFileUpload } = useLocalFileUploader({
    limit: 3 * 1024 * 1024,
    disabled: false,
    onUpload: (imageFile: ImageFile) => {
      setUploading(false);

      if (imageFile.progress === 100) {
        setInputImageInfo(undefined);
        handleSaveAvatar(imageFile.fileId);
      }
    }
  });

  const handleSelect = useCallback(async () => {
    if (!inputImageInfo)
      return;
    setUploading(true);
    if ('file' in inputImageInfo) {
      handleLocalFileUpload(inputImageInfo.file);
      return;
    }
    // create local file
    const blob = await getCroppedImg(inputImageInfo.tempUrl, inputImageInfo.areaPixels, inputImageInfo.filename);
    const file = new File([blob], inputImageInfo.filename, { type: blob.type });
    handleLocalFileUpload(file);
  }, [inputImageInfo, setUploading, getCroppedImg]);

  return (
    <>
      <div className="relative group">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Avatar {...props} />
          {!DISABLE_UPLOAD_AVATAR && (
            <div
              onClick={() => setShowAvatarPicker(true)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <PencilLine className="text-xs text-white" />
            </div>
          )}
        </div>
      </div>

      <Dialog
        isOpen={showAvatarPicker}
        isLoading={uploading}
        title={t('account.change_avatar')}
        description=""
        confirmText={t('system.confirm')}
        cancelText={t('system.cancel')}
        onConfirm={handleSelect}
        onCancel={() => setShowAvatarPicker(false)}
      >
        <ImageInput onImageInput={handleImageInput} cropShape="round" />
      </Dialog>
    </>
  );
}
