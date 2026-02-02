import { EditorView } from 'codemirror';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const blueThemeBase = EditorView.theme(
  {
    '&': {
      color: '#EEEEEE',
      backgroundColor: '#222831',
    },
    '.cm-content': {
      caretColor: '#76ABAE',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#76ABAE',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#3E444F !important',
    },
    '.cm-gutters': {
      backgroundColor: '#222831',
      color: '#545862',
      border: 'none',
    },
  },
  { dark: true },
);

const blueHighlightStyle = HighlightStyle.define([
  {
    tag: [t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6],
    color: '#76ABAE',
    fontWeight: 'bold',
  },
  { tag: t.processingInstruction, color: '#19c9c9', fontWeight: 'bold' },
  { tag: t.keyword, color: '#93A1A1' },
  { tag: t.string, color: '#EEEEEE' },
  { tag: t.comment, color: '#5F6C75', fontStyle: 'italic' },
  { tag: t.strong, color: '#76ABAE', fontWeight: 'bold' },
  { tag: [t.url, t.link], color: '#76ABAE', textDecoration: 'underline' },
  { tag: t.variableName, color: '#D1D5DB' },
  { tag: t.function(t.variableName), color: '#A7C5C9' },
]);

export const blueDarkTheme = [blueThemeBase, syntaxHighlighting(blueHighlightStyle)];
