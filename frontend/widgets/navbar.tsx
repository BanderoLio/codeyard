import { CodeyardIcon } from '../components/codeyard-icon';

export function Navbar({ titleFont }: { titleFont: string }) {
  return (
    <nav className="grid w-full grid-cols-3 items-center justify-items-center px-4 py-2">
      <div></div>
      <div className="flex flex-row items-center justify-center">
        <CodeyardIcon width={64} height={64} />
        <h1 className={`text-4xl font-bold ${titleFont}`}>
          <span className="text-primary">Code</span>yard
        </h1>
      </div>
      <div></div>
    </nav>
  );
}
