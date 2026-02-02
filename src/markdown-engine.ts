import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.use({
  breaks: true,
  gfm: true,
});

export const renderMarkdownTo = (content: string, container: HTMLElement) => {
  const rawHtml = marked.parse(content) as string;
  container.innerHTML = DOMPurify.sanitize(rawHtml);
};
