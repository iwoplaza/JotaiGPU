import { atom } from 'jotai/vanilla';
import * as d from 'typegpu/data';
import { gpuAtom, withUniform } from 'jotai-gpu';

const counterAtom = withUniform(d.f32, atom(0));

const doubleAtom = gpuAtom(d.f32, (get) => {
	'kernel';
	return get(counterAtom) * 2;
});

const quadAtom = atom(async (get) => {
	return (await get(doubleAtom)) * 2;
});
