export const bufferFromBase64 = (b64: string) => {
  const raw = window.atob(b64);
  const n = raw.length;
  const a = new Uint8Array(new ArrayBuffer(n));
  for (var i = 0; i < n; i++) {
    a[i] = raw.charCodeAt(i);
  }
  return a.buffer;
};
