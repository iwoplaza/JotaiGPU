import { atom } from 'jotai';
import type { Atom, Setter } from 'jotai/vanilla';
import tgpu, { type TgpuComputePipeline } from 'typegpu';
import type { AnyData, Infer, InferGPU } from 'typegpu/data';
import { getRoot, getRootSync } from './root.ts';
import { setGpuContext } from './gpu-context.ts';
import type { Getter } from 'jotai';

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

		const bufferAtom = atom((get) => {
			const root = getRootSync(get);
			// TODO: Allow users to define how the result of this atom can be used.
			// biome-ignore lint/suspicious/noExplicitAny: it's fine, just use storage for now
			return root.createBuffer(schema).$usage('storage' as any);
		});

		const pipelineAtom = atom<
			Promise<readonly [TgpuComputePipeline, Array<Atom<unknown>>]>,
			[],
			{ peek: Getter; set: Setter }
		>(
			async (get, { setSelf }) => {
				const root = await getRoot(get);
				const buffer = get(bufferAtom);
				const storage = buffer.as('mutable');

				const mainCompute = tgpu['~unstable'].computeFn({
					workgroupSize: [1, 1, 1],
				})(() => {
					storage.value = wrapped() as InferGPU<TSchema>;
				});

				const valueUpdates: (() => void)[] = [];
				const valueDeps: Array<Atom<unknown>> = [];
				const pipeline = root['~unstable']
					.withCompute(mainCompute)
					.createPipeline();

				const { peek, set } = setSelf();

				setGpuContext({ peek, get, set, valueUpdates, valueDeps });
				root.unwrap(pipeline);
				setGpuContext(undefined);

				return [pipeline, valueDeps] as const;
			},
			(peek, set) => ({ peek, set }),
		);

		const gpuAtom = atom(async (get) => {
			await getRoot(get); // ensuring the root is available.
			const [pipeline, valueDeps] = await get(pipelineAtom);
			const resultBuffer = get(bufferAtom);

			// Depending on the values of... our dependencies
			for (const dep of valueDeps) {
				get(dep);
			}

			// TODO: Pass in the amount of workgroups that the user configures
			pipeline.dispatchWorkgroups(1);
			return (await resultBuffer).read();
		}) as GPUAtom<TSchema, TValue>;

		return gpuAtom;
	};
}
