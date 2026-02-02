import LZString from 'lz-string';

const DEFAULT_MESSAGE = `## Try writing here...`;

export const updateURL = (content: string) => {
  const compressed = LZString.compressToEncodedURIComponent(content);
  window.history.replaceState(null, '', `#${compressed}`);
};

export const loadFromURL = (): string => {
  const hash = window.location.hash.slice(1);
  if (!hash) return DEFAULT_MESSAGE;

  const decompressed = LZString.decompressFromEncodedURIComponent(hash);
  return decompressed || DEFAULT_MESSAGE;
};
