import { hooks } from "./hooks.ts";
import { mado } from "./mado.ts";

export type Subscriber = () => void;

export class Signal<T> {
  subscribers = new Set<Subscriber>();

  constructor(private _value: T) {}

  set value(newValue: T) {
    if (this._value === newValue) return;
    this._value = newValue;

    for (const fn of this.subscribers) {
      fn();
    }
  }

  get value() {
    current.calledSignals.add(this);

    return this._value;
  }

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
  }
}

type ReactiveEnviron = {
  child?: ReactiveEnviron;
  definedSignals: Set<Signal<any>>;
  calledSignals: Set<Signal<any>>;
  styles: (string | Signal<string>)[];
  onCleanupHandler: Set<() => void>;
};

let current: ReactiveEnviron;

export const newReactiveEnv = () => {
  const res = current;

  current = {
    definedSignals: new Set(),
    calledSignals: new Set(),
    styles: [],
    onCleanupHandler: new Set(),
  };

  if (res) {
    res.child = current;
  }

  return res;
};

void newReactiveEnv();

export const signal = <T>(value: T): Signal<T> => {
  const s = new Signal(value);

  current.definedSignals.add(s);

  return s;
};

export const computed = <T>(fn: () => T, deps?: Signal<any>[]) => {
  const res = signal(fn());

  if (deps == null) {
    deps = [...current.calledSignals];
    current.calledSignals = new Set();
  }

  const onChange = () => {
    res.value = fn();
  };

  for (const dep of deps) {
    dep.subscribe(onChange);
  }

  return res;
};

export const useEffect = (fn: () => void, deps?: Signal<any>[]) => {
  if (deps == null) {
    deps = [...current.definedSignals];
    current.calledSignals = new Set();
  }

  for (const dep of deps) {
    dep.subscribe(fn);
  }

  fn();
};

export const onCleanup = (fn: () => void) => {
  current.onCleanupHandler.add(fn);
};

export const awaited = <T>(promise: PromiseLike<T>, placeholder: T) => {
  const res = signal(placeholder);

  promise.then((value) => res.value = value);

  return res;
};

export const useStyle = (style: string | Signal<string>) => {
  current.styles.push(style);
};

const oldEndComponentHook = hooks.endComponent;
hooks.endComponent = (node, _com) => {
  if (
    mado.isClientSide && current.styles.length && node instanceof mado.Element
  ) {
    const children = Array.from(node.childNodes);
    node.attachShadow({ mode: "open" });

    for (const style of current.styles) {
      const elm = mado.document.createElement("style");

      if (style instanceof Signal) {
        elm.innerHTML = style.value;

        style.subscribe(() => {
          elm.innerHTML = style.value;
        });
      } else {
        elm.innerHTML = style;
      }

      node.shadowRoot!.append(elm);
    }

    node.shadowRoot!.append(...children);
  }

  oldEndComponentHook?.(node, _com);

  void newReactiveEnv();
};
