export const copyToClipboard = async (value: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};
