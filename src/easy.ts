import { hooks } from "./hooks.ts";
import { JSX } from "./jsx-runtime.ts";
import { mado } from "./mado.ts";
import { Signal } from "./reactive.ts";
import { childrenToNode } from "./utils.ts";

type _ChildType =
  | Node
  | Signal<any>
  | { toString(): string };

export type ChildType =
  | _ChildType
  | _ChildType[];

export type Component<P> = (props: P) => Node;

export type ExtractProps<C extends Component<any> | string> = C extends
  Component<infer P> ? P
  : C extends string ? JSX.IntrinsicElements[C]
  : never;

export const jsx = <C extends string | Component<any>>(
  name: C,
  props: ExtractProps<C>,
) => {
  if (typeof name == "string") {
    const elm = mado.document.createElement(name);

    for (const key in props) {
      if (key == "children") {
        elm.append(...childrenToNode(props[key] as ChildType[]));
      } else if (key.startsWith("on")) {
        const evtName = key.slice(2).replace(/^./, (x) => x.toLowerCase());

        elm.addEventListener(evtName, props[key]);
      } else {
        const value: unknown = props[key];
        if (value instanceof Signal) {
          elm.setAttribute(key, "" + value.value);

          value.subscribe(() => {
            elm.setAttribute(key, "" + value.value);
          });
        } else {
          elm.setAttribute(key, "" + value);
        }
      }
    }

    return elm;
  } else {
    hooks.beginComponent?.(name);

    const res = name(props);

    hooks.endComponent?.(res, name);

    return res;
  }
};
