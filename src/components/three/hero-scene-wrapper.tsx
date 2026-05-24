"use client";

import dynamic from "next/dynamic";
import { HeroFallback } from "./hero-fallback";

export const HeroScene = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => <HeroFallback />,
});
