import { toast } from "@/app/ui/toast";
import { ALLOW_FILE_EXTENSIONS } from "@/config";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import ImageUploader from "./image-uploader";
import { useAuth } from "@/hooks/use-auth";

export type ImageFileType = 'all' | 'local_file' | 'remote_url';

export type ImageFile = {
  type: ImageFileType;
  fileId: string;
  file?: File;
  url: string;
  progress: number;
  base64Url?: string;
}

type LocalFileUploaderProps = {
  disabled?: boolean;
  limit?: number;
  onUpload: (imageFile: ImageFile) => void;
}

export default function useLocalFileUploader({ limit, disabled = false, onUpload }: LocalFileUploaderProps) {
  const { t } = useTranslation();
  const { getAccessToken: authToken } = useAuth();

  const handleLocalFileUpload = useCallback((file: File) => {
    if (disabled)
      return;

    if (!ALLOW_FILE_EXTENSIONS.includes(file.type.split('/')[1]))
      return;

    if (limit && file.size > limit) {
      toast.error(t('account.image_uploader.upload_limit_exceeded'));
      return;
    }

    const imageFile: ImageFile = {
      type: 'local_file',
      fileId: '',
      file,
      url: '',
      base64Url: '',
      progress: 0,
    };

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      onUpload(imageFile);

      ImageUploader({
        file,
        isPublic: !authToken(),
        token: authToken(),
        onProgress: (progress: number) => {
          onUpload({ ...imageFile, progress });
        },
        onSuccess: ((res) => {
          onUpload({ ...imageFile, fileId: res.id, progress: 100 });
        }),
        onError: (err) => {
          toast.error(`Upload file: ${err.message}`);
          onUpload({ ...imageFile, progress: -1 });
        }
      });
    });

    reader.addEventListener('error', () => {
      toast.error(t('account.image_uploader.read_error'));
      onUpload({ ...imageFile });
    });

    reader.readAsDataURL(file);
  }, [disabled, limit, t, onUpload]);

  return {
    disabled,
    handleLocalFileUpload
  }
}