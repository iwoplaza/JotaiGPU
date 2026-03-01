// import { Link } from 'waku';
import { codeToHtml } from 'shiki';
import { CautionIcon } from '@/components/CautionIcon';
import CounterGraph from '@/components/CounterGraph';

const codeExample = `\
import { atom, createStore } from 'jotai';
import { d } from 'typegpu';
import { withUpload, gpuAtom } from 'jotai-gpu';

const store = createStore();

// Vanilla atoms can be decorated with a WGSL schema, allowing
// their value to be uploaded to the GPU
const countAtom = withUpload(d.f32, atom(1));

// GPU atoms compute their value on the GPU. They can derive
// other GPU atoms, or \`withUpload(...)\` decorated atoms
const doubleAtom = gpuAtom(d.f32, () => {
  'use gpu'; // <- this function is executable on the GPU
  return countAtom.$ * 2;
});

// GPU atoms are just asynchronous atoms from the perspective
// of vanilla atoms, so we can download the result and derive it
const quadAtom = atom(async (get) => {
  return (await get(doubleAtom)) * 2;
});

// Listening to changes of \`quadAtom\`. There are also
// easy bindings for frameworks like React
store.sub(quadAtom, async () => {
  console.log(await store.get(quadAtom));
});`;

export default async function Home() {
  const codeHtml = await codeToHtml(codeExample, {
    lang: 'typescript',
    theme: 'catppuccin-mocha',
  });

  return (
    <div className="bg-[#131419] text-white flex-1 flex flex-col">
      <title>JotaiGPU</title>
      <header className="flex justify-center items-center my-12">
        <img
          src="/jotaigpu-logo-dark.svg"
          alt="JotaiGPU Logo"
          width={471}
          height={146}
          className="h-16 w-auto"
        />
      </header>

      <main className="mb-64">
        <div className="mx-auto max-w-2xl text-white/80 leading-6 px-4">
          <p>
            <span className="text-white">JotaiGPU</span> — a toolkit for building declarative data
            graphs, spanning across your CPU and GPU, with automatic dependency tracking. It&apos;s
            built on top of{' '}
            <a href="https://jotai.org" className="text-white underline">
              Jotai
            </a>{' '}
            and{' '}
            <a href="https://typegpu.com" className="text-white underline">
              TypeGPU
            </a>
            , allowing your entire data pipeline to be written in TypeScript, both the CPU and GPU
            portions.
          </p>

          <aside className="px-5 py-0.5 my-6 bg-accent-900 rounded">
            <p className="flex items-center gap-2">
              <CautionIcon />
              <strong>Limited WebGPU Support</strong>
            </p>
            <p>
              The WebGPU API, which is the basis for technologies like{' '}
              <a href="https://typegpu.com" className="text-white underline">
                TypeGPU
              </a>
              , is yet to be widely supported by browsers. Interactive examples might not work for
              you.
            </p>
          </aside>

          <p>Let&apos;s look at an interactive example.</p>

          <div
            className="my-6 rounded-md overflow-auto text-sm"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki
            dangerouslySetInnerHTML={{ __html: codeHtml }}
          />
        </div>

        <CounterGraph />
      </main>

      <footer className="flex justify-center items-center py-4 mt-auto">
        <div className="flex items-center self-start gap-4 opacity-70">
          Iwo Plaza &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
