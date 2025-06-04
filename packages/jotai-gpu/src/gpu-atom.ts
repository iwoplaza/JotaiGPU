import type { Atom } from 'jotai';
import type { AnyData, Infer } from 'typegpu/data';
import type { WithUniform } from './buffered-atom.ts';

type GPUGetter = <Value>(atom: Atom<Value> & WithUniform<AnyData>) => Value;

export interface GPUAtom<TSchema extends AnyData, TValue extends Infer<TSchema>>
	extends Atom<Promise<TValue>> {
	schema: TSchema;
}

export function gpuAtom<TSchema extends AnyData, TValue extends Infer<TSchema>>(
	schema: TSchema,
	read: (get: GPUGetter) => TValue,
): GPUAtom<TSchema, TValue> {
	// TODO
	// biome-ignore lint/suspicious/noExplicitAny: Not implemented yet
	return null as any;
}
