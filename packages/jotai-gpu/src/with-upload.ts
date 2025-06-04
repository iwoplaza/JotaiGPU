import type { SetStateAction } from 'jotai';
import type { WritableAtom } from 'jotai';
import { atom, type Atom } from 'jotai';
import type { AnyData, Infer, InferGPU } from 'typegpu/data';
import { getGpuGetter } from './gpu-getter.ts';

export interface WithUpload<TSchema extends AnyData> {
	usage: ['uniform'];
	schema: TSchema;
	value: InferGPU<TSchema>;
	$: InferGPU<TSchema>;
}

function isWritable(
	atom: unknown,
): atom is WritableAtom<unknown, unknown[], unknown> {
	return !!(atom as WritableAtom<unknown, unknown[], unknown>)?.write;
}

export function withUpload<
	TSchema extends AnyData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: WritableAtom<TValue, [SetStateAction<TValue>], void>,
): WritableAtom<TValue, [SetStateAction<TValue>], void> & WithUpload<TSchema>;

export function withUpload<
	TSchema extends AnyData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: Atom<TValue>,
): Atom<TValue> & WithUpload<TSchema>;

export function withUpload<
	TSchema extends AnyData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: Atom<TValue>,
): Atom<TValue> & WithUpload<TSchema> {
	let wrapperAtom: Atom<TValue> & WithUpload<TSchema>;

	if (isWritable(wrappedAtom)) {
		wrapperAtom = atom(
			(get) => get(wrappedAtom),
			(_get, set, value: TValue) => {
				if ('write' in wrappedAtom) {
					set(wrappedAtom, value);
				}
			},
		) as unknown as Atom<TValue> & WithUpload<TSchema>;
	} else {
		wrapperAtom = atom((get) => get(wrappedAtom)) as unknown as Atom<TValue> &
			WithUpload<TSchema>;
	}

	const valueAttribs = {
		get() {
			const get = getGpuGetter();
			return get(wrapperAtom);
		},
	};

	Object.defineProperty(wrapperAtom, 'value', valueAttribs);
	Object.defineProperty(wrapperAtom, '$', valueAttribs);

	wrapperAtom.schema = schema;

	return wrapperAtom;
}
