import { basicSetup, EditorView } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { vim, Vim } from '@replit/codemirror-vim';
import { StateEffect } from '@codemirror/state';

import { blueDarkTheme } from './theme';
import {loadFromURL, updateURL} from './url-state';
import { renderMarkdownTo } from './markdown-engine';
import './style.css';

const editorContainer = document.querySelector<HTMLDivElement>('#editor-wrapper')!;
const previewContainer = document.querySelector<HTMLDivElement>('#preview-wrapper')!;
const commanderBtn = document.querySelector<HTMLButtonElement>('#commander-btn')!;
const menuItems = document.querySelector<HTMLDivElement>('#menu-items')!;
const newNoteBtn = document.querySelector<HTMLButtonElement>('#new-note-btn')!;
const themeBtn = document.querySelector<HTMLButtonElement>('#theme-btn')!;
const shareBtn = document.querySelector<HTMLButtonElement>('#share-btn')!;
const pdfBtn = document.querySelector<HTMLButtonElement>('#pdf-btn')!;
const githubBtn = document.querySelector<HTMLButtonElement>('#github-btn')!;
const escBindingSelect = document.querySelector<HTMLSelectElement>('#esc-binding')!;
const toast = document.querySelector<HTMLDivElement>('#toast')!;

const initialContent = loadFromURL();
renderMarkdownTo(initialContent, previewContainer);

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

document.body.classList.toggle('dark-theme', isDark);
document.body.classList.toggle('light-theme', !isDark);

const onUpdate = EditorView.updateListener.of((v) => {
  if (v.docChanged) {
    const content = v.state.doc.toString();
    renderMarkdownTo(content, previewContainer);
    updateURL(content);
  }
});

const editor = new EditorView({
  doc: initialContent,
  extensions: [
    basicSetup,
    vim(),
    markdown(),
    EditorView.lineWrapping,
    onUpdate,
    isDark ? blueDarkTheme : [],
  ],
  parent: editorContainer,
});

const toggleMenu = () => {
  const isHidden = menuItems.classList.contains('hidden');
  if (isHidden) {
    menuItems.classList.remove('hidden');
    commanderBtn.style.transform = 'rotate(90deg)';
  } else {
    menuItems.classList.add('hidden');
    commanderBtn.style.transform = 'rotate(0deg)';
  }
};

commanderBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});

document.addEventListener('click', (e) => {
  if (!menuItems.contains(e.target as Node) && e.target !== commanderBtn) {
    menuItems.classList.add('hidden');
    commanderBtn.style.transform = 'rotate(0deg)';
  }
});

document.addEventListener('keydown', (e) => {
  if (menuItems.classList.contains('hidden')) return;

  const key = e.key.toLowerCase();
  switch (key) {
    case 'n':
      e.preventDefault();
      newNoteBtn.click();
      break;
    case 't':
      e.preventDefault();
      themeBtn.click();
      break;
    case 'y':
      e.preventDefault();
      shareBtn.click();
      break;
    case 'p':
      e.preventDefault();
      pdfBtn.click();
      break;
    case 'g':
      e.preventDefault();
      githubBtn.click();
      break;
    case 'escape':
      e.preventDefault();
      menuItems.classList.add('hidden');
      commanderBtn.style.transform = 'rotate(0deg)';
      break;
  }
});

themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.body.classList.toggle('dark-theme', isDark);
  document.body.classList.toggle('light-theme', !isDark);

  editor.dispatch({
    effects: StateEffect.reconfigure.of([
      basicSetup,
      vim(),
      markdown(),
      EditorView.lineWrapping,
      onUpdate,
      isDark ? blueDarkTheme : [],
    ]),
  });
});

const applyVimSettings = (binding: string) => {
  Vim.unmap('jj', 'insert');
  Vim.unmap('jk', 'insert');
  if (binding !== 'default') {
    Vim.map(binding, '<Esc>', 'insert');
  }
};

escBindingSelect.addEventListener('change', (e) => {
  const binding = (e.target as HTMLSelectElement).value;
  applyVimSettings(binding);
  localStorage.setItem('vim-binding', binding);
});

const savedBinding = localStorage.getItem('vim-binding') || 'default';
escBindingSelect.value = savedBinding;
applyVimSettings(savedBinding);

shareBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(window.location.href);
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
  menuItems.classList.add('hidden');
});

pdfBtn.addEventListener('click', () => {
  menuItems.classList.add('hidden');
  window.print();
});

githubBtn.addEventListener('click', () => {
  window.open('https://github.com/GoodbyePlanet/vimark', '_blank');
  menuItems.classList.add('hidden');
});

newNoteBtn.addEventListener('click', () => {
  editor.dispatch({
      changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: ""
      }
  });

  menuItems.classList.add('hidden');
  commanderBtn.style.transform = 'rotate(0deg)';

  editor.focus();
});