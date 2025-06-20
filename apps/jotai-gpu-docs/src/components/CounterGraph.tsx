import { atom, useSetAtom } from 'jotai';
import { gpuAtom, withUpload } from 'jotai-gpu';
import { useCallback } from 'react';
import * as d from 'typegpu/data';
import { Arrow } from './Arrow.tsx';
import { AtomBox } from './AtomBox.tsx';

const counterAtom = withUpload(d.f32, atom(1));

const doubleAtom = gpuAtom(d.f32)(() => {
  'kernel';
  return counterAtom.$ * 2;
});

const quadAtom = atom(async (get) => {
  return (await get(doubleAtom)) * 2;
});

export default function CounterGraph() {
  const setCounter = useSetAtom(counterAtom);

  const increment = useCallback(() => {
    setCounter((prev) => prev + 1);
  }, [setCounter]);

  return (
    <div className="mx-auto w-fit grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <section className="flex flex-col items-end">
        <h2 className="text-slate-600 mb-4 self-end text-2xl">CPU</h2>
        <button
          type="button"
          onClick={increment}
          className="px-4 py-2 block mx-auto my-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 transition-colors duration-75 rounded-md text-white"
        >
          Increment
        </button>
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
      <div className="mx-16 self-stretch border-l border-dashed opacity-20 -z-10" />
      <section className="flex flex-col items-start">
        <h2 className="text-slate-600 mb-4 self-start text-2xl">GPU</h2>
        <div className="h-36" />
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
  );
}
