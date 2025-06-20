import { atom, useSetAtom } from 'jotai';
import { gpuAtom, withUpload } from 'jotai-gpu';
import { useCallback } from 'react';
import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { Arrow } from './Arrow';
import { AtomBox } from './AtomBox';
tgpu;

const counterAtom = withUpload(d.f32, atom(1));

const doubleAtom = gpuAtom(d.f32)(() => {
	'kernel';
	return counterAtom.$ * 2;
});

const quadAtom = atom(async (get) => {
	return (await get(doubleAtom)) * 2;
});

export default function CounterApp() {
	const setCounter = useSetAtom(counterAtom);

	const increment = useCallback(() => {
		setCounter((prev) => prev + 1);
	}, [setCounter]);

	return (
		<div>
			<h1 className="text-center text-xl my-8">Jotai GPU - Compute Graph Example</h1>
			<button
				type="button"
				onClick={increment}
				className="px-4 py-2 block mx-auto my-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 transition-colors duration-75 rounded-md"
			>
				Increment counter
			</button>
			<div className="mx-auto w-fit grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
				<section className="flex flex-col items-end">
					<h2 className="text-slate-600 mb-4 self-center">Computed on the <strong>CPU</strong></h2>
					<div className="relative">
						<AtomBox
							valueAtom={counterAtom}
							codeHtml={`\
const counterAtom = withUpload(d.f32, atom(1));`}
						/>
						<div className="absolute -right-10 top-5">
							<Arrow x={60} y={60} />
						</div>
					</div>
					<div className="h-32" />
					<AtomBox
						valueAtom={quadAtom}
						codeHtml={`\
const quadAtom = atom(async (get) => {
	return (await get(doubleAtom)) * 2;
});`}
					/>
				</section>
				<div className='mx-16 self-stretch border-l border-dashed opacity-20 -z-10' />
				<section className="flex flex-col items-start">
					<h2 className="text-slate-600 mb-4 self-center">Computed on the <strong>GPU</strong></h2>
					<div className="h-24" />
					<div className="relative">
						<AtomBox
							valueAtom={doubleAtom}
							codeHtml={`\
const doubleAtom = gpuAtom(d.f32)(() => {
	'kernel';
	return counterAtom.$ * 2;
});`}
						/>
						<div className="absolute -left-6 top-20">
							<Arrow x={-60} y={60} />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
