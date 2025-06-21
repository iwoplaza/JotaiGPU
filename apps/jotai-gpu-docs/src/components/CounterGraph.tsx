import { atom, useSetAtom } from 'jotai';
import { gpuAtom, withUpload } from 'jotai-gpu';
import { useCallback } from 'react';
import * as d from 'typegpu/data';
import { Arrow } from './Arrow.tsx';
import { AtomBox } from './AtomBox.tsx';

const countAtom = withUpload(d.f32, atom(1));

const doubleAtom = gpuAtom(d.f32)(() => {
  'kernel';
  return countAtom.$ * 2;
});

const quadAtom = atom(async (get) => {
  return (await get(doubleAtom)) * 2;
});

const countAtomCode = `\
const countAtom = withUpload(d.f32, atom(1));`;

const doubleAtomCode = `\
const doubleAtom = gpuAtom(d.f32)(() => {
  'kernel';
  return countAtom.$ * 2;
});`;

const quadAtomCode = `\
const quadAtom = atom(async (get) => {
  return (await get(doubleAtom)) * 2;
});`;

function EnvLabel({
  children,
  className,
}: { children?: string; className?: string }) {
  return (
    <h2
      className={`hidden lg:block row-start-1 text-slate-600 mb-4 text-2xl ${className}`}
    >
      {children}
    </h2>
  );
}

export default function CounterGraph() {
  const setCounter = useSetAtom(countAtom);

  const increment = useCallback(() => {
    setCounter((prev) => prev + 1);
  }, [setCounter]);

  return (
    <div className="mx-auto w-fit grid grid-rows-[auto_auto_auto_auto] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] place-items-center gap-y-16 lg:gap-y-4">
      <EnvLabel className="col-start-1 justify-self-end">CPU</EnvLabel>
      <div className="hidden lg:block row-start-1 col-start-2 row-span-4 mx-16 self-stretch border-l border-dashed opacity-20 -z-10" />
      <EnvLabel className="col-start-3 justify-self-start">GPU</EnvLabel>
      <div className="relative row-start-2 col-start-1 lg:place-self-end">
        <button
          type="button"
          onClick={increment}
          className="px-4 py-2 block mx-auto my-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 transition-colors duration-75 rounded-md text-white"
        >
          Increment
        </button>
        <AtomBox valueAtom={countAtom} codeHtml={countAtomCode} />
        <div className="hidden lg:block absolute -right-10 top-24">
          {/* Desktop arrow */}
          <Arrow x={60} y={60} />
        </div>
        <div className="lg:hidden absolute inset-x-0 bottom-0 flex justify-center">
          {/* Mobile arrow */}
          <Arrow x={0} y={60} />
        </div>
      </div>
      <div className="relative row-start-3 lg:col-start-3 lg:place-self-start">
        <AtomBox valueAtom={doubleAtom} codeHtml={doubleAtomCode} />
        <div className="hidden lg:block absolute -left-6 top-20">
          {/* Desktop arrow */}
          <Arrow x={-60} y={60} />
        </div>
        <div className="lg:hidden absolute inset-x-0 bottom-0 flex justify-center">
          {/* Mobile arrow */}
          <Arrow x={0} y={60} />
        </div>
      </div>
      <div className="row-start-4 col-start-1 lg:place-self-end">
        <AtomBox valueAtom={quadAtom} codeHtml={quadAtomCode} />
      </div>
    </div>
  );
}
