import { atom } from 'jotai/vanilla';
import type { Atom } from 'jotai/vanilla';
import tgpu, { d } from 'typegpu';
import { setGpuContext } from './gpu-context.ts';
import { getRoot, getRootSync } from './root.ts';

export interface GPUAtom<
  TSchema extends d.AnyData,
  TValue extends d.InferGPU<TSchema>,
> extends Atom<Promise<TValue>> {
  readonly schema: TSchema;
}

export function gpuAtom<TSchema extends d.AnyData, TValue extends d.InferGPU<TSchema>>(
  schema: TSchema,
  read: () => TValue,
): GPUAtom<TSchema, TValue> {
  const wrapped = tgpu.fn([], schema)(read as () => never);

  const resultBufferAtom = atom((get) => {
    const root = getRootSync(get);
    // TODO: Allow users to define how the result of this atom can be used.
    return root.createBuffer(schema as d.AnyData).$usage('storage');
  });

  const pipelineAtom = atom((get) => {
    const root = getRootSync(get);
    const resultBuffer = get(resultBufferAtom);
    const resultStorage = resultBuffer.as('mutable');

    const valueDeps: Array<Atom<unknown>> = [];
    const pipeline = root.createGuardedComputePipeline(() => {
      'use gpu';
      resultStorage.$ = wrapped() as d.InferGPU<TSchema>;
    });

    setGpuContext({ get, valueDeps });
    root.unwrap(pipeline.pipeline);
    setGpuContext(undefined);

    return [pipeline, valueDeps] as const;
  });

  const gpuAtom = atom(async (get) => {
    await getRoot(get); // ensuring the root is available.
    const [pipeline, valueDeps] = get(pipelineAtom);
    const resultBuffer = get(resultBufferAtom);

    // Depending on the values of... our dependencies
    for (const dep of valueDeps) {
      get(dep);
    }

    // TODO: Pass in the amount of threads/workgroups that the user configures
    pipeline.dispatchThreads();
    return resultBuffer.read();
  }) as GPUAtom<TSchema, TValue>;

  return gpuAtom;
}
