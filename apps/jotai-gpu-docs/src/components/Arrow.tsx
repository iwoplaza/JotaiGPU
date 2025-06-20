function Arrowhead() {
  return (
    <svg
      height="16"
      viewBox="0 0 27 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Arrow head</title>
      <path
        d="M25.6402 25.6043C26.3969 26.3809 26.3969 27.6191 25.6402 28.3957L3.43252 51.1897C2.18032 52.4749 -2.47356e-06 51.5884 -2.39512e-06 49.794L-4.02407e-07 4.20599C-3.23971e-07 2.41159 2.18032 1.52507 3.43252 2.81033L25.6402 25.6043Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface ArrowProps {
  x: number;
  y: number;
  unit?: 'px' | 'rem' | 'em';
}

export function Arrow(props: ArrowProps) {
  const { x, y, unit = 'px' } = props;

  const magnitude = Math.sqrt(x * x + y * y);
  const angle = Math.atan2(y, x);

  return (
    <span
      className="inline-block relative w-0 h-0 drop-shadow-[0px_0px_2px_#ffffff66] text-[#8c91a8]"
      style={{ rotate: `${angle}rad` }}
    >
      <span className="absolute left-0 top-0 flex justify-end items-center">
        <div
          className="bg-current h-0.5 rounded-sm -mr-1"
          style={{ width: `${magnitude}${unit}` }}
        />
        <Arrowhead />
      </span>
    </span>
  );
}
