import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { atom, createStore } from 'jotai/vanilla';
import { gpuAtom, withUpload } from 'jotai-gpu';
tgpu;

const counterAtom = withUpload(d.f32, atom(1));

const doubleAtom = gpuAtom(d.f32)(() => {
	'kernel';
	return counterAtom.$ * 2;
});

const quadAtom = atom(async (get) => {
	return (await get(doubleAtom)) * 2;
});

const store = createStore();

console.log(await store.get(quadAtom));
