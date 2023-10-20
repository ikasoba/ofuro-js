import { Component } from "./easy.ts";

export interface Hooks {
  beginComponent?(component: Component<any>): void;
  endComponent?(node: Node, component: Component<any>): void;
}

export const hooks: Hooks = {};
