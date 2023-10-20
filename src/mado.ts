export let mado = {
  isClientSide: true,
  document: globalThis.document,
  Element: globalThis.Element,
  Node: globalThis.Node,
  DocumentFragment: globalThis.DocumentFragment,
  Text: globalThis.Text,
  Comment: globalThis.Comment,
};

export const setMado = (o: typeof mado) => {
  mado = o;
};
