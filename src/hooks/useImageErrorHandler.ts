import { useState } from 'react';

export const useImageErrorHandler = () => {
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setErroredImages((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
  };

  const isImageErrored = (id: string): boolean => {
    return Boolean(erroredImages[id]);
  };

  return { handleImageError, isImageErrored };
};
