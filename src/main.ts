import {basicSetup, EditorView} from "codemirror";
import {markdown} from "@codemirror/lang-markdown";
import {vim, Vim} from "@replit/codemirror-vim";
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language";
import {tags as t} from "@lezer/highlight";
import {marked} from "marked";
import LZString from "lz-string";
import DOMPurify from "dompurify";
import {StateEffect} from "@codemirror/state";

import './style.css';

marked.use({
    breaks: true,
    gfm: true
});

const blueThemeBase = EditorView.theme({
    "&": {
        color: "#EEEEEE",
        backgroundColor: "#222831"
    },
    ".cm-content": {
        caretColor: "#76ABAE"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "#76ABAE"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#3E444F !important"
    },
    ".cm-gutters": {
        backgroundColor: "#222831",
        color: "#545862",
        border: "none"
    }
}, {dark: true});

const blueHighlightStyle = HighlightStyle.define([
    {
        tag: [t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6],
        color: "#76ABAE", fontWeight: "bold"
    },
    {tag: t.processingInstruction, color: "#19c9c9", fontWeight: "bold"},
    {tag: t.keyword, color: "#93A1A1"},
    {tag: t.string, color: "#EEEEEE"},
    {tag: t.comment, color: "#5F6C75", fontStyle: "italic"},
    {tag: t.strong, color: "#76ABAE", fontWeight: "bold"},
    {tag: [t.url, t.link], color: "#76ABAE", textDecoration: "underline"},
    {tag: t.variableName, color: "#D1D5DB"},
    {tag: t.function(t.variableName), color: "#A7C5C9"}
]);

const blueDarkTheme = [blueThemeBase, syntaxHighlighting(blueHighlightStyle)];

const editorContainer = document.querySelector<HTMLDivElement>('#editor-wrapper')!;
const previewContainer = document.querySelector<HTMLDivElement>('#preview-wrapper')!;

const commanderBtn = document.querySelector<HTMLButtonElement>('#commander-btn')!;
const menuItems = document.querySelector<HTMLDivElement>('#menu-items')!;
const themeBtn = document.querySelector<HTMLButtonElement>('#theme-btn')!;
const shareBtn = document.querySelector<HTMLButtonElement>('#share-btn')!;
const pdfBtn = document.querySelector<HTMLButtonElement>('#pdf-btn')!;
const githubBtn = document.querySelector<HTMLButtonElement>('#github-btn')!;
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
    const rawHtml = marked.parse(content) as string;
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

document.addEventListener('keydown', (e) => {
    // 1. Guard: Only run if the menu is actually OPEN
    if (menuItems.classList.contains('hidden')) return;

    const key = e.key.toLowerCase();

    switch (key) {
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

const savedBinding = localStorage.getItem('vim-binding') || 'default';
escBindingSelect.value = savedBinding;
applyVimSettings(savedBinding);

const onUpdate = EditorView.updateListener.of((v) => {
    if (v.docChanged) {
        const content = v.state.doc.toString();
        renderMarkdown(content);
        updateURL(content);
    }
});

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

const initialContent = loadFromURL();
renderMarkdown(initialContent);
document.body.classList.toggle('dark-theme', isDark);
document.body.classList.toggle('light-theme', !isDark);

const editor = new EditorView({
    doc: initialContent,
    extensions: [
        basicSetup,
        vim(),
        markdown(),
        EditorView.lineWrapping,
        onUpdate,
        isDark ? blueDarkTheme : []
    ],
    parent: editorContainer
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
            EditorView.lineWrapping, onUpdate,
            isDark ? blueDarkTheme : []
        ])
    });
});