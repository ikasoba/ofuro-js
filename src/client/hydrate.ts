import { useEffect } from "../reactive.ts";
import { NodeToArray, replaceChildren } from "../utils.ts";

export function hydrate(fn: () => Node, node: Node) {
  let nodes: Node[];

  const replace = () => {
    replaceChildren([...nodes], Array.from(node.childNodes));
  };

  useEffect(() => {
    if (nodes == null) return;

    replace();
  });

  nodes = NodeToArray(fn());

  replace();
}
