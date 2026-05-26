"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface GalleryContextValue {
  /** 用 GalleryImage 的稳定 uid 打开幻灯片到对应索引 */
  openByUid: (uid: string) => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function useGallery(): GalleryContextValue {
  const value = useContext(GalleryContext);
  if (!value) {
    throw new Error("useGallery must be used inside <GalleryProvider>");
  }
  return value;
}

/**
 * 全站图片预览容器。
 *
 * 工作机制:
 * 1. children 内的 <GalleryImage> 渲染带 `data-gallery-uid` 的原生 <img>
 * 2. 点击时通过 uid 触发 openByUid,Provider 现场 querySelectorAll 收集 DOM 中所有
 *    `img[data-gallery-item]` 按文档顺序构成 slides 列表,定位当前 uid 的索引
 * 3. 由于 SSR 完成时图片已经在 DOM 中,无需 register/effect,顺序天然稳定
 */
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [index, setIndex] = useState(-1);

  const openByUid = useCallback((uid: string) => {
    if (typeof document === "undefined") return;
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img[data-gallery-item]"));
    if (imgs.length === 0) return;
    const next: SlideImage[] = imgs.map((img) => {
      const src = img.getAttribute("data-gallery-src") ?? img.currentSrc ?? img.src;
      const alt = img.alt ?? "";
      return {
        src,
        alt,
        // 用 alt 作为底部 caption(captions 插件读取 description)
        description: alt || undefined,
      };
    });
    const i = imgs.findIndex((img) => img.getAttribute("data-gallery-uid") === uid);
    setSlides(next);
    setIndex(i >= 0 ? i : 0);
  }, []);

  const value = useMemo<GalleryContextValue>(() => ({ openByUid }), [openByUid]);

  return (
    <GalleryContext.Provider value={value}>
      {children}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={Math.max(0, index)}
        slides={slides}
        plugins={[Zoom, Counter, Fullscreen, Captions, Thumbnails]}
        carousel={{ finite: slides.length <= 1, preload: 1 }}
        animation={{ fade: 160, swipe: 220 }}
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        thumbnails={{ position: "bottom", width: 96, height: 64, border: 1, gap: 8 }}
        captions={{ showToggle: false, descriptionTextAlign: "start" }}
        styles={{
          container: { backgroundColor: "rgba(8, 8, 8, 0.94)" },
        }}
      />
    </GalleryContext.Provider>
  );
}
