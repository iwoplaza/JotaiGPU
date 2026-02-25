export const EnvLabel = ({
  children,
  className,
}: { children?: string; className?: string }) => (
  <h2
    className={`hidden lg:block row-start-1 text-slate-600 mb-4 text-2xl ${className}`}
  >
    {children}
  </h2>
);
