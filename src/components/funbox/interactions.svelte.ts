import type { Attachment } from "svelte/attachments";
import { prefersReducedMotion, Spring } from "svelte/motion";
import type { TransitionConfig } from "svelte/transition";

export function makeShaker(el: Element) {
  const spring = new Spring(0);

  $effect(() => (el.style.transform = `translateX(${spring.current}px)`));

  return () => {
    if (prefersReducedMotion.current) {
      return;
    }
    spring
      .set(10)
      .then(() => spring.set(-10))
      .then(() => spring.set(0));
  };
}

export function makeBouncer(el: Element) {
  let initialScale = parseFloat(el.computedStyleMap().get("scale")?.toString() || "1");

  if (Number.isNaN(initialScale)) {
    initialScale = 1;
  }

  const spring = new Spring(initialScale, {
    stiffness: 0.25,
  });

  $effect(() => {
    el.style.transform = `scale(${spring.current})`;
  });

  return () => {
    if (prefersReducedMotion.current) {
      return;
    }
    spring.set(initialScale * 0.8).then(() => spring.set(initialScale));
  };
}

export function makeRatchet(el: Element) {
  let initialRotation = parseFloat(el.computedStyleMap().get("rotate")?.toString() || "0");

  if (Number.isNaN(initialRotation)) {
    initialRotation = 0;
  }

  const spring = new Spring(initialRotation, {
    stiffness: 0.75,
  });

  $effect(() => {
    el.style.transform = `rotateZ(${spring.current}deg)`;
  });

  return () => {
    if (prefersReducedMotion.current) {
      return;
    }
    let direction = Math.random() > 0.5 ? 1 : -1;
    let intensity = 1 + Math.random();
    spring
      .set(7 * intensity * direction)
      .then(() => spring.set(12 * intensity * -direction * 0.4))
      .then(() => spring.set(initialRotation));
  };
}

export const bounceOnEvent: (event: keyof HTMLElementEventMap) => Attachment = (event) => {
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

export const ratchetOnEvent: (event: keyof HTMLElementEventMap) => Attachment = (event) => {
  return (element: Element) => {
    const ratchet = makeRatchet(element);

    element.addEventListener(event, ratchet);
    return () => element.removeEventListener(event, ratchet);
  };
};

export const preventDefault: (event: keyof HTMLElementEventMap) => Attachment = (event) => {
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
  let shaken = false;

  return {
    delay: params?.delay ?? 0,
    duration: params?.duration ?? 300,
    tick: (t) => {
      if (!shaken) shake();
      shaken = true;
    },
  };
};
