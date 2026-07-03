import * as React from "react";

type NextImageProps = {
  src: string | { src: string };
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

export default function Image({
  src,
  alt = "",
  width,
  height,
  fill,
  priority,
  quality,
  placeholder,
  blurDataURL,
  unoptimized,
  loading,
  sizes,
  className,
  style,
  ...rest
}: NextImageProps) {
  const resolved = typeof src === "string" ? src : src?.src ?? "";
  const fillStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    : {};
  return (
    <img
      src={resolved}
      alt={alt}
      width={fill ? undefined : (width as number | undefined)}
      height={fill ? undefined : (height as number | undefined)}
      loading={loading}
      sizes={sizes}
      className={className}
      style={{ ...fillStyle, ...style }}
      {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  );
}
