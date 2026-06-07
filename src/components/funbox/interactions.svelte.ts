import type { Attachment } from "svelte/attachments";
import { Spring } from "svelte/motion";

const springStiffness = 0.5;
const springDamping = 0.5;

export function makeShaker(el: Element) {
  const spring = new Spring(0, {
    stiffness: springStiffness,
    damping: springDamping,
  });

  $effect(() => (el.style.translate = `${spring.current}px 0`));

  return () => {
    spring.set(5);

    setTimeout(() => spring.set(-5), 100);
    setTimeout(() => spring.set(0), 200);
  };
}

export function makeBouncer(el: Element) {
  const initialScale = parseFloat(el?.style?.scale || "100");

  const spring = new Spring(initialScale, {
    stiffness: springStiffness,
    damping: springDamping,
  });

  $effect(() => {
    el.style.scale = `${spring.current}%`;
  });

  return () => {
    spring.set(70);
    setTimeout(() => spring.set(120), 100);
    setTimeout(() => spring.set(initialScale), 200);
  };
}

export const bounceOnEvent: (event: string) => Attachment = (event: string) => {
  return (element: Element) => {
    const bounce = makeBouncer(element);

    element.addEventListener(event, bounce);
    return () => element.removeEventListener(event, bounce);
  };
};

export const shakeOnEvent: (event: string) => Attachment = (event: string) => {
  return (element: Element) => {
    const shake = makeShaker(element);

    element.addEventListener(event, shake);
    return () => element.removeEventListener(event, shake);
  };
};
