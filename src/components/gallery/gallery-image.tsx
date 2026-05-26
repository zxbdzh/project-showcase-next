"use client";

import { useId, type CSSProperties, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useGallery } from "./gallery-provider";

type GalleryImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "loading" | "decoding"> & {
  /** 必填,空字符串会直接放弃注册 */
  src?: string;
  alt?: string;
  style?: CSSProperties;
};

/**
 * 可点击放大的图片。
 *
 * 数据契约:必须放在 <GalleryProvider> 内。
 * 渲染原生 <img> + cursor-zoom + 标识属性,点击交给 Provider 现场扫描 DOM 拼接 slides。
 */
export function GalleryImage({
  src,
  alt = "",
  className,
  style,
  onClick,
  ...rest
}: GalleryImageProps) {
  const uid = useId();
  const { openByUid } = useGallery();

  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={src}
      alt={alt}
      data-gallery-item=""
      data-gallery-uid={uid}
      data-gallery-src={src}
      loading="lazy"
      decoding="async"
      style={style}
      className={cn("cursor-zoom-in transition-opacity duration-200 hover:opacity-90", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        openByUid(uid);
      }}
    />
  );
}
