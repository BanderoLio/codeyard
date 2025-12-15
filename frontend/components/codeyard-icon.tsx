import Image from 'next/image';

type CodeyarnIconProps = {
  width: number;
  height: number;
};

export function CodeyardIcon({ width, height }: CodeyarnIconProps) {
  return (
    <Image
      src={'/codeyard.png'}
      alt="Codeyard"
      className="aspect-square [image-rendering:pixelated]"
      width={width}
      height={height}
    />
  );
}
