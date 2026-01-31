export const formatPhoneNumber = (phone?: string) => {
  if (!phone) return '';
  return phone.replace(/^(\d{4})(\d+)/, (_, first, rest) => {
    const chunks = rest.match(/.{1,3}/g);
    return chunks ? `${first}.${chunks.join('.')}` : phone;
  });
};