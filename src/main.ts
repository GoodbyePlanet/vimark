import {basicSetup, EditorView} from "codemirror";
import {markdown} from "@codemirror/lang-markdown";
import {vim} from "@replit/codemirror-vim";
import {oneDark} from "@codemirror/theme-one-dark";
import {marked} from "marked";
import LZString from "lz-string";
import DOMPurify from "dompurify";
import './style.css';
// Need StateEffect to reconfigure plugins dynamically
import {StateEffect} from "@codemirror/state";

// --- Configuration & DOM Elements ---
const editorContainer = document.querySelector<HTMLDivElement>('#editor-wrapper')!;
const previewContainer = document.querySelector<HTMLDivElement>('#preview-wrapper')!;
const themeBtn = document.querySelector<HTMLButtonElement>('#theme-btn')!;
const shareBtn = document.querySelector<HTMLButtonElement>('#share-btn')!;
const pdfBtn = document.querySelector<HTMLButtonElement>('#pdf-btn')!;
const toast = document.querySelector<HTMLDivElement>('#toast')!;

// Default Welcome Message
const DEFAULT_TEXT = `# Welcome to VimMD

* **Vim Mode**: Enabled by default (i to insert, :w to save/sync).
* **Share**: Everything is stored in the URL. Copy it to share.
* **Export**: Click PDF to print/save.

## Try writing here...
`;

// --- State Management (URL Hashing) ---

/**
 * Compresses content and updates browser URL hash.
 * Uses lz-string for high compression to fit more text in the URL.
 */
const updateURL = (content: string) => {
    const compressed = LZString.compressToEncodedURIComponent(content);
    window.history.replaceState(null, '', `#${compressed}`);
};

/**
 * Decodes content from browser URL hash.
 */
const loadFromURL = (): string => {
    const hash = window.location.hash.slice(1); // Remove '#'
    if (!hash) return DEFAULT_TEXT;

    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    return decompressed || DEFAULT_TEXT;
};

// --- Markdown Rendering ---

const renderMarkdown = (content: string) => {
    // Parse markdown to HTML
    const rawHtml = marked.parse(content) as string;
    // Sanitize HTML to prevent XSS attacks
    previewContainer.innerHTML = DOMPurify.sanitize(rawHtml);
};

// --- Editor Initialization ---

let isDark = false;

// We create a view update listener to handle typing
const onUpdate = EditorView.updateListener.of((v) => {
    if (v.docChanged) {
        const content = v.state.doc.toString();
        renderMarkdown(content);
        updateURL(content);
    }
});

// Initial content load
const initialContent = loadFromURL();

// Setup CodeMirror
const editor = new EditorView({
    doc: initialContent,
    extensions: [
        basicSetup,             // Line numbers, fold gutter, brackets, etc.
        vim(),                  // VIM Mode (Essential requirement)
        markdown(),             // Markdown syntax highlighting
        EditorView.lineWrapping,// Wrap long lines
        onUpdate                // Listener for changes
        // Note: Theme is applied dynamically below
    ],
    parent: editorContainer
});

// Trigger initial render
renderMarkdown(initialContent);


// --- Feature Handlers ---

// 1. Theme Toggling
const toggleTheme = () => {
    isDark = !isDark;
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);

    // Reconfigure editor theme (CodeMirror needs explicit extension reconfig for internal styling)
    editor.dispatch({
        effects: StateEffect.reconfigure.of([
            basicSetup,
            vim(),
            markdown(),
            EditorView.lineWrapping,
            onUpdate,
            isDark ? oneDark : [] // Apply OneDark theme extension only if dark mode
        ])
    });
};

themeBtn.addEventListener('click', toggleTheme);

// 2. Share Functionality
shareBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        showToast();
    } catch (err) {
        console.error('Failed to copy', err);
    }
});

const showToast = () => {
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
};

// 3. PDF Export
pdfBtn.addEventListener('click', () => {
    // We rely on CSS @media print to hide the editor/toolbar and format the preview
    window.print();
});

// Handle initial theme check (optional system preference)
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    toggleTheme();
}