'use client';
import { useEffect } from 'react';

export const useFavicoBadge = (count: number) => {
  useEffect(() => {
    let favicon: import('favico.js').default | null = null;

    const init = async () => {
      const Favico = (await import('favico.js')).default;
      favicon = new Favico({ animation: 'pop' });
      favicon.badge(count);
    };

    init();

    return () => {
      favicon?.reset();
    };
  }, [count]);
};
