import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { gpuAtom, withUpload } from 'jotai-gpu';
import { atom, useAtomValue, useSetAtom, type Atom } from 'jotai';
import { Suspense, useCallback } from 'react';
tgpu;

const counterAtom = withUpload(d.f32, atom(1));

const doubleAtom = gpuAtom(d.f32)(() => {
	'kernel';
	return counterAtom.$ * 2;
});

const quadAtom = atom(async (get) => {
	return (await get(doubleAtom)) * 2;
});

export function CountDisplay(props: { countAtom: Atom<number> | Atom<Promise<number>> }) {
	const counter = useAtomValue(props.countAtom);

	return <p className='flex justify-center items-center w-8 h-8 bg-slate-200'>{counter}</p>;
}

export function Fallback() {
	return <p className='flex justify-center items-center w-8 h-8 bg-slate-200'>🌀</p>;
}

export default function CounterApp() {
	const setCounter = useSetAtom(counterAtom);

	const increment = useCallback(() => {
		setCounter((prev) => prev + 1);
	}, [setCounter]);

	return <div>
		<h1 className='text-center text-xl'>Jotai GPU - Compute Graph Example</h1>
		<button type="button" onClick={increment} className='px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md'>Increment</button>
		<div className='flex'>
			<section className='min-w-3xs flex flex-col items-center'>
				<h2>CPU</h2>
				<Suspense fallback={<Fallback />}>
					<CountDisplay countAtom={counterAtom} />
				</Suspense>
				<Suspense fallback={<Fallback />}>
					<CountDisplay countAtom={quadAtom} />
				</Suspense>
			</section>
			<section className='min-w-3xs flex flex-col items-center'>
				<h2>GPU</h2>
				<Suspense fallback={<Fallback />}>
					<CountDisplay countAtom={doubleAtom} />
				</Suspense>
			</section>
		</div>
	</div>
}