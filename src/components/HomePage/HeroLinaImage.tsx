import Image from "next/image";

type HeroLinaImageProps = {
  alt: string;
};

export default function HeroLinaImage({ alt }: HeroLinaImageProps) {
  return (
    <div className="hero-lina-visual relative mx-auto mb-[50px] flex w-full items-center justify-center flex-1">
      <div
        className="hero-lina-rings pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <span />
        <span />
        <span />
      </div>

      <Image
        src="/images/lina.png"
        alt={alt}
        width={512}
        height={512}
        priority
        className="relative z-10 h-auto w-full object-contain dark:hidden"
      />
      <Image
        src="/images/linaDark.png"
        alt={alt}
        width={512}
        height={512}
        priority
        className="relative z-10 hidden h-auto w-full object-contain dark:block"
      />
    </div>
  );
}
