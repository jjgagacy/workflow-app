import { Uploader } from "./uploader";

export type ImageUploaderProps = {
  file: File;
  isPublic?: boolean;
  url?: string;
  token?: string;
  onProgress: (progress: number) => void;
  onSuccess: (res: { id: string }) => void;
  onError: (error: Error) => void;
}

export default function ImageUploader({
  file,
  onProgress,
  onSuccess,
  onError,
  isPublic = false,
  url,
  token
}: ImageUploaderProps) {
  const formData = new FormData();
  formData.append('file', file);

  Uploader({
    options: {
      xhr: new XMLHttpRequest(),
      data: formData,
      onProgress,
      token,
    },
    isPublicApi: isPublic,
    url,
  }).then((res: { id: string }) => {
    onSuccess(res);
  }).catch((err) => {
    onError(err);
  });
}
