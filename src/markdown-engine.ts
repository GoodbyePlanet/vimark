import { marked } from 'marked';
import DOMPurify from 'dompurify';

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-');

marked.use({
  breaks: true,
  gfm: true,
  renderer: {
    heading({ text, depth }: { text: string; depth: number }): string {
      const id = slugify(text);
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },
  },
});

export const renderMarkdownTo = (content: string, container: HTMLElement) => {
  const rawHtml = marked.parse(content) as string;
  container.innerHTML = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['id'] });
};

export const setupAnchorScrolling = (container: HTMLElement) => {
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();

    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};
