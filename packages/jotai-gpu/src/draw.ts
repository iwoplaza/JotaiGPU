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

  let context = canvasToContextMap.get(target);
  if (!context) {
    context = target.getContext('webgpu') ?? undefined;
    if (!context) {
      throw new Error('WebGPU is not supported in this browser');
    }
    canvasToContextMap.set(target, context);

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device: root.device,
      format,
    });
  }

  const view = context.getCurrentTexture().createView();
}
