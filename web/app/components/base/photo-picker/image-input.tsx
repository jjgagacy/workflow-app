import { ChangeEvent, createRef, useEffect, useState } from 'react';
import Cropper, { type Area, type CropperProps } from 'react-easy-crop';
import { cn } from '@/utils/classnames';
import { useDraggableUploader } from './hooks';
import { ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { checkIsAnimatedImage } from './utils';
import { ALLOW_FILE_EXTENSIONS } from '@/config';

export type OnImageInput = {
  (isCropped: true, tempUrl: string, areaPixels: Area, filename: string): void;
  (isCropped: false, file: File): void;
}

type ImageInputProps = {
  className?: string;
  cropShape?: CropperProps['cropShape'];
  onImageInput?: OnImageInput;
}

export type ImageInputInfo = { file: File } | { tempUrl: string; areaPixels: Area; filename: string; }

export default function ImageInput({ className, cropShape, onImageInput }: ImageInputProps) {
  const { t } = useTranslation();
  const [image, setImage] = useState<{ file: File, url: string }>();
  const [animatedImage, setAnimatedImage] = useState(false);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    }
  }, [image]);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const {
    dragActive,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDraggableUploader((file: File) => setImage({ file, url: URL.createObjectURL(file) }))

  const onCropComplete = async (_: Area, areaPixels: Area) => {
    if (!image)
      return;
    onImageInput?.(true, image.url, areaPixels, image.file.name);
  }

  const handleLocalFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({ file, url: URL.createObjectURL(file) });
      checkIsAnimatedImage(file).then((isAnimated) => {
        setAnimatedImage(isAnimated);
        if (isAnimated)
          onImageInput?.(false, file);
      });
    }
  };

  const handleCropped = () => {
    if (animatedImage) {
      return (
        <img src={image?.url} alt='' />
      );
    }

    return (
      <Cropper
        image={image?.url}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape={cropShape}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />
    );
  }

  const inputRef = createRef<HTMLInputElement>();

  return (
    <>
      <div className={cn(className, 'w-full px-3 py-1.5')}>
        <div
          className={cn(
            dragActive && 'border-primary-600',
            'relative flex aspect-square flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed text-gray-500'
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!image
            ? (
              <>
                <ImagePlus className='pointer-events-none mb-3 h-[30px] w-[30px]' />
                <div className='mb-[2px] text-sm font-medium'>
                  <span className='pointer-events-none'>{t('account.image_input.drop_image_here')}</span>&nbsp;
                  <button
                    className='text-green-600'
                    onClick={() => inputRef.current?.click()}
                  >
                    {t('account.image_input.browse')}
                  </button>
                  <input
                    ref={inputRef}
                    type='file'
                    className='hidden'
                    onClick={e => ((e.target as HTMLInputElement).value = '')}
                    accept={ALLOW_FILE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                    onChange={handleLocalFileInput}
                  />
                </div>
              </>
            )
            : handleCropped()}
        </div>
      </div>
    </>
  );
}