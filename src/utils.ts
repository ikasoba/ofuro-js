import { ChildType } from "./easy.ts";
import { mado } from "./mado.ts";
import { Signal } from "./reactive.ts";

export const childrenToNode = (children: ChildType[] | ChildType) => {
  return children instanceof Array
    ? children.map((x) => childToNode(x))
    : [childToNode(children)];
};

export const childToNode = (node: ChildType): Node => {
  if (node instanceof mado.Node) {
    return node;
  } else if (node instanceof Signal) {
    const f = mado.document.createDocumentFragment();
    f.append(...signalToNode(node));

    return f;
  } else if (node instanceof Array) {
    const f = mado.document.createDocumentFragment();
    const nodes = childrenToNode(node);
    f.append(...nodes);

    if (nodes.length == 0) {
      f.append(mado.document.createComment(""));
    }

    return f;
  } else if (node == null) {
    return mado.document.createComment("");
  } else {
    return mado.document.createTextNode(node.toString());
  }
};

export const NodeToArray = (node: Node) => {
  if (node instanceof mado.DocumentFragment) {
    return Array.from(node.childNodes);
  }

  return [node];
};

export const signalToNode = (signal: Signal<ChildType>) => {
  let prevNodes = NodeToArray(childToNode(signal.value));

  signal.subscribe(() => {
    const nodes = NodeToArray(childToNode(signal.value));

    replaceChildren(nodes, prevNodes);

    prevNodes = nodes;
  });

  return prevNodes;
};

export const replaceChildren = (nodes: Node[], prevNodes: Node[]) => {
  for (let i = 0; i < nodes.length && i < prevNodes.length; i++) {
    const newNode = nodes[i]!, oldNode = prevNodes[i]!;

    if (!equalNode(newNode, oldNode)) {
      oldNode.parentNode?.replaceChild(newNode, oldNode);
    } else {
      nodes[i] = oldNode;
    }
  }

  if (nodes.length > prevNodes.length) {
    let prevNode = nodes[prevNodes.length - 1]!;

    for (let i = prevNodes.length; i < nodes.length; i++) {
      const node = nodes[i]!;

      prevNode.parentNode?.insertBefore(node, prevNode.nextSibling);
      prevNode = node;
    }
  } else if (prevNodes.length > nodes.length) {
    for (let i = prevNodes.length - 1; i >= nodes.length; i--) {
      const node = prevNodes[i]!;

      node.parentNode?.removeChild(node);
    }
  }
};

export const equalNode = (x: Node, y: Node) => {
  if (x instanceof mado.Text && y instanceof mado.Text) {
    return x.textContent == y.textContent;
  } else if (x instanceof mado.Comment && y instanceof mado.Comment) {
    return x.textContent == y.textContent;
  } else {
    return x == y;
  }
};
