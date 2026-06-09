import type { Attachment } from "svelte/attachments";
import { Spring } from "svelte/motion";
import type { TransitionConfig } from "svelte/transition";

export function makeShaker(el: Element) {
  const spring = new Spring(0);

  $effect(() => (el.style.translate = `${spring.current}px 0`));

  return () => {
    spring.set(10);

    setTimeout(() => spring.set(-10), 100);
    setTimeout(() => spring.set(0), 200);
  };
}

export function makeBouncer(el: Element) {
  let initialScale = parseFloat(el.computedStyleMap().get("scale")?.toString() || "1");

  if (Number.isNaN(initialScale)) {
    initialScale = 1;
  }

  const spring = new Spring(initialScale);

  $effect(() => {
    el.style.scale = `${spring.current}`;
  });

  return () => {
    spring.set(initialScale - 0.2);
    setTimeout(() => spring.set(initialScale + 0.2), 100);
    setTimeout(() => spring.set(initialScale), 200);
  };
}

export function makeRatchet(el: Element) {
  let initialRotation = parseFloat(
    el.computedStyleMap().get("rotate")?.toString() || "0",
  );

  if (Number.isNaN(initialRotation)) {
    initialRotation = 0;
  }

  const spring = new Spring(initialRotation, {
    stiffness: 0.4,
    damping: 0.3,
  });

  $effect(() => {
    el.style.rotate = `${spring.current}deg`;
  });

  return () => {
    let intensity = 1 + Math.random();
    spring.set(7 * intensity);
    setTimeout(() => spring.set(-15 * (2 - intensity)), 100);
    setTimeout(() => spring.set(initialRotation), 200);
  };
}

export const bounceOnEvent: (event: keyof HTMLElementEventMap) => Attachment = (
  event,
) => {
  return (element: Element) => {
    const bounce = makeBouncer(element);

    element.addEventListener(event, bounce);
    return () => element.removeEventListener(event, bounce);
  };
};

export const shakeOnEvent: (event: keyof HTMLElementEventMap) => Attachment = (event) => {
  return (element: Element) => {
    const shake = makeShaker(element);

    element.addEventListener(event, shake);
    return () => element.removeEventListener(event, shake);
  };
};

export const ratchetOnEvent: (event: keyof HTMLElementEventMap) => Attachment = (
  event,
) => {
  return (element: Element) => {
    const ratchet = makeRatchet(element);

    element.addEventListener(event, ratchet);
    return () => element.removeEventListener(event, ratchet);
  };
};

export const preventDefault: (event: keyof HTMLElementEventMap) => Attachment = (
  event,
) => {
  return (element: Element) => {
    const prevent = (e: Event) => e.preventDefault();

    element.addEventListener(event, prevent);
    return () => element.removeEventListener(event, prevent);
  };
};

export const wordleFlip = (
  node: HTMLElement,
  params: { delay?: number; duration?: number } | undefined = undefined,
): TransitionConfig => {
  return {
    delay: params?.delay ?? 0,
    duration: params?.duration ?? 300,
    css: (t: number) => `
      transform: rotateX(${(1 - t) * 180}deg);
    `,
  };
};

export const shakeUp = (
  node: HTMLElement,
  params: { delay?: number; duration?: number } | undefined = undefined,
): TransitionConfig => {
  const shake = makeShaker(node);

  return {
    delay: params?.delay ?? 0,
    duration: params?.duration ?? 300,
    tick: (t) => {
      if (t <= 0) shake();
    },
  };
};
