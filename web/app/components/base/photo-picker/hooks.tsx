import { useCallback, useState } from "react"

export const useDraggableUploader = <T extends HTMLElement>(setImageFn: (file: File) => void) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false);

    const file = e.dataTransfer.files[0];

    if (!file)
      return;

    setImageFn(file);
  }, [setImageFn]);

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    dragActive
  }
}