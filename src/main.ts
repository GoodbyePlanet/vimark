import {basicSetup, EditorView} from "codemirror";
import {markdown} from "@codemirror/lang-markdown";
import {vim, Vim} from "@replit/codemirror-vim";
import {oneDark} from "@codemirror/theme-one-dark";
import {marked} from "marked";
import LZString from "lz-string";
import DOMPurify from "dompurify";
import {StateEffect} from "@codemirror/state";

import './style.css';

const editorContainer = document.querySelector<HTMLDivElement>('#editor-wrapper')!;
const previewContainer = document.querySelector<HTMLDivElement>('#preview-wrapper')!;

// Menu Elements
const commanderBtn = document.querySelector<HTMLButtonElement>('#commander-btn')!;
const menuItems = document.querySelector<HTMLDivElement>('#menu-items')!;
const themeBtn = document.querySelector<HTMLButtonElement>('#theme-btn')!;
const shareBtn = document.querySelector<HTMLButtonElement>('#share-btn')!;
const pdfBtn = document.querySelector<HTMLButtonElement>('#pdf-btn')!;
const escBindingSelect = document.querySelector<HTMLSelectElement>('#esc-binding')!;
const toast = document.querySelector<HTMLDivElement>('#toast')!;

const DEFAULT_MESSAGE = `## Try writing here...`;

/**
 * Compresses content and updates browser URL hash.
 * Uses lz-string for high compression to fit more text in the URL.
 */
const updateURL = (content: string) => {
    const compressed = LZString.compressToEncodedURIComponent(content);
    window.history.replaceState(null, '', `#${compressed}`);
};

const loadFromURL = (): string => {
    const hash = window.location.hash.slice(1); // Remove '#'
    if (!hash) return DEFAULT_MESSAGE;

    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    return decompressed || DEFAULT_MESSAGE;
};

const renderMarkdown = (content: string) => {
    // Parse markdown to HTML
    const rawHtml = marked.parse(content) as string;
    // Sanitize HTML to prevent XSS attacks
    previewContainer.innerHTML = DOMPurify.sanitize(rawHtml);
};

const toggleMenu = () => {
    const isHidden = menuItems.classList.contains('hidden');
    if (isHidden) {
        menuItems.classList.remove('hidden');
        // Rotate button animation
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


// --- VIM Settings Logic (Refined) ---

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

// Load saved binding
const savedBinding = localStorage.getItem('vim-binding') || 'default';
escBindingSelect.value = savedBinding;
applyVimSettings(savedBinding);


// --- Editor Setup (Same Logic, Styling handled by CSS) ---
let isDark = false;

const onUpdate = EditorView.updateListener.of((v) => {
    if (v.docChanged) {
        const content = v.state.doc.toString();
        renderMarkdown(content);
        updateURL(content);
    }
});

const initialContent = loadFromURL();
renderMarkdown(initialContent);

const editor = new EditorView({
    doc: initialContent,
    extensions: [
        basicSetup,
        vim(),
        markdown(),
        EditorView.lineWrapping,
        onUpdate
    ],
    parent: editorContainer
});


// --- Feature Handlers ---

// Theme
themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);

    editor.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup, vim(), markdown(), EditorView.lineWrapping, onUpdate,
            isDark ? oneDark : []
        ])
    });
});

// Share
shareBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
    menuItems.classList.add('hidden'); // Close menu on action
});

// PDF
pdfBtn.addEventListener('click', () => {
    menuItems.classList.add('hidden'); // Close menu on action
    window.print();
});

// Initial Theme Check
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    themeBtn.click(); // Programmatically click to sync state
}