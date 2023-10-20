import {
  Comment,
  Document,
  DocumentFragment,
  Element,
  Node,
  Text,
} from "../../deps/deno_dom.ts";
import { mado, setMado } from "../mado.ts";

export function render(fn: () => Node): string {
  const document = new Document();
  document.body = document.createElement("body");

  const prevMado = mado;

  setMado(
    {
      isClientSide: false,
      document: document as any,
      Node: Node as any,
      Element: Element as any,
      Comment: Comment as any,
      DocumentFragment: DocumentFragment as any,
      Text: Text as any,
    },
  );

  document.body.append(fn());

  const res = document.body.innerHTML;

  setMado(prevMado);

  return res;
}
