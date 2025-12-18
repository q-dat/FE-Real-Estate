export default function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}
