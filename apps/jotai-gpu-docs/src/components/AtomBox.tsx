import { type Atom, atom, useAtomValue } from 'jotai';
import { atomFamily, unwrap } from 'jotai/utils';
import { useMemo } from 'react';

interface AtomBoxProps {
  valueAtom: Atom<number | Promise<number>>;
  codeHtml: string;
}

const shikiAtom = atom(() => import('shiki'));

const htmlAtoms = atomFamily((code: string) => {
  return atom(async (get) => {
    const { codeToHtml } = await get(shikiAtom);
    return codeToHtml(code, {
      lang: 'typescript',
      theme: 'catppuccin-mocha',
    });
  });
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

export function AtomBox(props: AtomBoxProps) {
  const codeHtml = useAtomValue(htmlAtoms(props.codeHtml));
  const latestAtom = useMemo(
    () => unwrap(props.valueAtom, (prev) => prev),
    [props.valueAtom],
  );
  const currentAtom = useMemo(() => unwrap(props.valueAtom), [props.valueAtom]);
  const latest = useAtomValue(latestAtom);
  const current = useAtomValue(currentAtom);

  return (
    <article
      className={`w-min ${current === undefined ? 'opacity-50' : 'opacity-100 transition-all'}`}
    >
      <div className="bg-[#1e1e2e] rounded-md shadow-2xl">
        <div className="px-4 py-1 text-xs">
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki
            dangerouslySetInnerHTML={{ __html: codeHtml }}
            className="**:!bg-transparent"
          />
        </div>
        <footer className="rounded-b-md bg-[#2b2b40] px-2 py-1 text-center">
          {latest ?? '🌀'}
        </footer>
      </div>
    </article>
  );
}
