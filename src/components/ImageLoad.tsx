import { LazyLoadImage } from "react-lazy-load-image-component";
import placeholder from "@/components/img/30690.png";

function LoadImage({
  src,
  alt,
  className,
  width,
  height,
  disableLazy = false,
  ...props
}: {
  src: string;
  alt: string;
  className: string;
  width?: number;
  height?: number;
  disableLazy: boolean;
  [key: string]: unknown;
}): React.ReactNode {
  // function to resize image using canvas and return Blob URL
  const resizeUrl =
    height && width
      ? `/api/resize?url=${src}&width=${width}&height=${height}`
      : src;

  return (
    <>
      <LazyLoadImage
        src={resizeUrl}
        alt={alt}
        className={className}
        placeholderSrc={placeholder.src}
        effect="blur"
        visibleByDefault={disableLazy}
        {...props}
      />
    </>
  );
}

export default LoadImage;
