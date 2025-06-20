import { atomWithLazy } from 'jotai/utils';
import type { Getter } from 'jotai/vanilla';
import tgpu, { type TgpuRoot } from 'typegpu';

const rootAtom = atomWithLazy(async () => {
  const root = await tgpu.init();
  return root;
});

const promiseCache = new WeakMap<Promise<TgpuRoot>, TgpuRoot>();

export function getRoot(get: Getter): Promise<TgpuRoot> | TgpuRoot {
  const rootPromise = get(rootAtom);
  const cached = promiseCache.get(rootPromise);
  if (cached) {
    return cached;
  }

  return rootPromise.then((root) => {
    promiseCache.set(rootPromise, root);
    return root;
  });
}

export function getRootSync(get: Getter): TgpuRoot {
  const rootPromise = get(rootAtom);
  const cached = promiseCache.get(rootPromise);
  if (cached) {
    return cached;
  }

  throw new Error('Invariant: Root is not available yet.');
}
