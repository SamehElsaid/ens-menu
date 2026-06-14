import type { ReactNode } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import placeholder from "@/components/img/30690.png";
import { resolveMenuItemImageSrc } from "./menuItemImage";

function LoadImage({
  src,
  alt,
  className,
  width,
  height,
  disableLazy = false,
  cover = false,
  wrapperClassName = "",
  ...props
}: {
  src: string;
  alt: string;
  className: string;
  width?: number;
  height?: number;
  disableLazy?: boolean;
  cover?: boolean;
  wrapperClassName?: string;
  [key: string]: unknown;
}): ReactNode {
  const resolvedSrc = resolveMenuItemImageSrc(src);

  let imageSrc = resolvedSrc;
  if (width && height) {
    const params = new URLSearchParams({
      url: resolvedSrc,
      width: String(width),
      height: String(height),
    });
    if (cover) params.set("fit", "cover");
    imageSrc = `/api/resize?${params.toString()}`;
  }

  return (
    <LazyLoadImage
      src={imageSrc}
      alt={alt}
      className={className}
      wrapperClassName={wrapperClassName}
      placeholderSrc={placeholder.src}
      effect="blur"
      visibleByDefault={disableLazy}
      {...props}
    />
  );
}

export default LoadImage;
