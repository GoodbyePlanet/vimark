# vimark - URL Based VIM Notes

A lightweight, client-side markdown editor featuring VIM keybindings and URL-based state management.

## Features

* **VIM Mode**: Full VIM emulation using CodeMirror 6 and `@replit/codemirror-vim`.
* **State in URL**: No database. Content is compressed (LZ-String) and stored in the URL hash. Share the link, share the
  note.
* **Markdown Preview**: Instant rendering of markdown content.
* **PDF Export**: Native browser print styling to export notes as PDF.
* **Theming**: Toggle between Dark and Light modes.

## Tech Stack

* **Vite**: Build tool and dev server.
* **TypeScript**: Type-safe logic.
* **CodeMirror 6**: The editor engine.
* **Marked**: Markdown parser.
* **DOMPurify**: Security (XSS prevention).

## How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port shown in terminal).

3. **Build for Production**:
   ```bash
   npm run build
   ```