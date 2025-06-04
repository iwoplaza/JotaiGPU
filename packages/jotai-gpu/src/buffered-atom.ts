import type { SetStateAction } from 'jotai';
import type { WritableAtom } from 'jotai';
import { atom, type Atom } from 'jotai';
import type { AnyData, Infer } from 'typegpu/data';

export interface WithUniform<TSchema extends AnyData> {
	usage: ['uniform'];
	schema: TSchema;
}

function isWritable(
	atom: unknown,
): atom is WritableAtom<unknown, unknown[], unknown> {
	return !!(atom as WritableAtom<unknown, unknown[], unknown>)?.write;
}

export function withUniform<
	TSchema extends AnyData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: Atom<TValue>,
): Atom<TValue> & WithUniform<TSchema>;

export function withUniform<
	TSchema extends AnyData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: WritableAtom<TValue, [SetStateAction<TValue>], void>,
): WritableAtom<TValue, [SetStateAction<TValue>], void> & WithUniform<TSchema>;

export function withUniform<
	TSchema extends AnyData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: Atom<TValue>,
): Atom<TValue> & WithUniform<TSchema> {
	let wrapperAtom: Atom<TValue> & WithUniform<TSchema>;

	if (isWritable(wrappedAtom)) {
		wrapperAtom = atom(
			(get) => get(wrappedAtom),
			(_get, set, value: TValue) => {
				if ('write' in wrappedAtom) {
					set(wrappedAtom, value);
				}
			},
		) as unknown as Atom<TValue> & WithUniform<TSchema>;
	} else {
		wrapperAtom = atom((get) => get(wrappedAtom)) as unknown as Atom<TValue> &
			WithUniform<TSchema>;
	}

	wrapperAtom.schema = schema;

	return wrapperAtom;
}
