import { type Atom, atom, useAtomValue, useSetAtom } from 'jotai';
import { gpuAtom, withUpload } from 'jotai-gpu';
import { Suspense, useCallback } from 'react';
import tgpu from 'typegpu';
import * as d from 'typegpu/data';
tgpu;

const counterAtom = withUpload(d.f32, atom(1));

const doubleAtom = gpuAtom(d.f32)(() => {
	'kernel';
	return counterAtom.$ * 2;
});

const quadAtom = atom(async (get) => {
	return (await get(doubleAtom)) * 2;
});

export function CountDisplay(props: {
	countAtom: Atom<number> | Atom<Promise<number>>;
}) {
	const counter = useAtomValue(props.countAtom);

	return (
		<span className="flex justify-center items-center w-8 h-8 bg-slate-200">
			{counter}
		</span>
	);
}

export function Fallback() {
	return (
		<span className="flex justify-center items-center w-8 h-8 bg-slate-200">
			🌀
		</span>
	);
}

export default function CounterApp() {
	const setCounter = useSetAtom(counterAtom);

	const increment = useCallback(() => {
		setCounter((prev) => prev + 1);
	}, [setCounter]);

	return (
		<div>
			<h1 className="text-center text-xl">Jotai GPU - Compute Graph Example</h1>
			<button
				type="button"
				onClick={increment}
				className="px-4 py-2 block mx-auto my-4 bg-slate-100 hover:bg-slate-200 rounded-md"
			>
				Increment
			</button>
			<div className="flex">
				<section className="min-w-3xs flex flex-col items-center">
					<h2 className="text-slate-600 mb-4">CPU</h2>
					<Suspense fallback={<Fallback />}>
						<p className="flex items-center gap-1">
							counter: <CountDisplay countAtom={counterAtom} />
						</p>
					</Suspense>
					<div className="h-20" />
					<p className="flex items-center gap-1">
						quad:
						<Suspense fallback={<Fallback />}>
							<CountDisplay countAtom={quadAtom} />
						</Suspense>
					</p>
				</section>
				<section className="min-w-3xs flex flex-col items-center">
					<h2 className="text-slate-600 mb-4">GPU</h2>
					<div className="h-14" />
					<p className="flex items-center gap-1">
						double:
						<Suspense fallback={<Fallback />}>
							<CountDisplay countAtom={doubleAtom} />
						</Suspense>
					</p>
				</section>
			</div>
		</div>
	);
}
