import type { createStore } from 'jotai';
import type { Pixel } from './pixel.ts';
import { getRoot } from './root.ts';
import { isPromiseLike } from './utils.ts';

export interface DrawOptions {
  target: HTMLCanvasElement;
}

const canvasToContextMap = new WeakMap<HTMLCanvasElement, GPUCanvasContext>();

export async function draw(
  store: ReturnType<typeof createStore>,
  pixel: Pixel,
  options: DrawOptions,
) {
  const { target } = options;

  const rootOrPromise = getRoot(store.get);
  const root = isPromiseLike(rootOrPromise)
    ? await rootOrPromise
    : rootOrPromise;

  if (typeof target.getContext === 'function') {
    // `target` is a canvas

    let context = canvasToContextMap.get(target);
    if (!context) {
      context = target.getContext('webgpu') ?? undefined;
      if (!context) {
        throw new Error('WebGPU is not supported in this browser');
      }
      canvasToContextMap.set(target, context);

      context.configure({
        device: root.device,
        format: 
      });
    }
  }
}
