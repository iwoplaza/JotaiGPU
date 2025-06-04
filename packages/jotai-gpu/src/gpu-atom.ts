import { atom } from 'jotai';
import type { Atom } from 'jotai/vanilla';
import tgpu from 'typegpu';
import type { AnyData, Infer, InferGPU } from 'typegpu/data';
import { getRoot } from './root.ts';
import { setGpuGetter } from './gpu-getter.ts';

export function isPromiseLike<T>(
	value: PromiseLike<T> | unknown,
): value is PromiseLike<T> {
	return typeof (value as PromiseLike<T>)?.then === 'function';
}

export type GPUAtomConstructor<TSchema extends AnyData> = <
	TValue extends Infer<TSchema>,
>(
	read: () => TValue,
) => GPUAtom<TSchema, TValue>;

export interface GPUAtom<TSchema extends AnyData, TValue extends Infer<TSchema>>
	extends Atom<Promise<TValue>> {
	schema: TSchema;
}

export function gpuAtom<TSchema extends AnyData>(
	schema: TSchema,
): GPUAtomConstructor<TSchema> {
	return <TValue extends Infer<TSchema>>(read: () => TValue) => {
		// TODO: Remove when `InferReturn` doesn't exist anymore
		// biome-ignore lint/suspicious/noExplicitAny: ^
		const wrapped = tgpu['~unstable'].fn([], schema)(read as any);

		const bufferAtom = atom(async (get) => {
			const root = await getRoot(get);
			// TODO: Allow users to define how the result of this atom can be used.
			// biome-ignore lint/suspicious/noExplicitAny: it's fine, just use storage for now
			return root.createBuffer(schema).$usage('storage' as any);
		});

		const pipelineAtom = atom(async (get) => {
			const root = await getRoot(get);
			const buffer = await get(bufferAtom);
			const storage = buffer.as('mutable');

			const mainCompute = tgpu['~unstable'].computeFn({
				workgroupSize: [1, 1, 1],
			})(() => {
				storage.value = wrapped() as InferGPU<TSchema>;
			});

			const pipeline = root['~unstable']
				.withCompute(mainCompute)
				.createPipeline();

			setGpuGetter(get);
			root.unwrap(pipeline);
			setGpuGetter(undefined);

			return pipeline;
		});

		const gpuAtom = atom(async (get) => {
			const pipeline = await get(pipelineAtom);
			const buffer = await get(bufferAtom);
			// TODO: Pass in the amount of workgroups that the user configures
			pipeline.dispatchWorkgroups(1);
			return (await buffer).read();
		}) as GPUAtom<TSchema, TValue>;

		return gpuAtom;
	};
}
