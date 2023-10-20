import { computed, signal, useStyle } from "easy-js";

export function Counter() {
  const count = signal(0);

  useStyle(computed(() => /* css */ `
    button {
      filter: hue-rotate(${count.value * (360 / 10)}deg);
      background-color: dodgerblue;
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem;
    }
  `));

  return (
    <div>
      <button onClick={() => count.value++}>
        count: {count}
      </button>
    </div>
  );
}
