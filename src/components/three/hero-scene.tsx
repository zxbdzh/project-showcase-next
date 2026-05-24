"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

function GlassCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);
  const data = useScroll();

  useFrame(() => {
    if (!meshRef.current) return;
    const offset = data.offset;
    meshRef.current.rotation.y = offset * Math.PI * 2;
    meshRef.current.rotation.x = offset * Math.PI * 0.5;
    const scale = 1 + offset * 0.3;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.35, 128, 16, 2, 3]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={0.4}
        roughness={0}
        metalness={0}
        ior={1.5}
        color="#4F46E5"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function StaticCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.35, 96, 12, 2, 3]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={0.4}
        roughness={0}
        metalness={0}
        ior={1.5}
        color="#4F46E5"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function Scene({ scrollDriven }: { scrollDriven: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <Environment preset="city" />
      {scrollDriven ? <GlassCrystal /> : <StaticCrystal />}
    </>
  );
}

export function HeroScene() {
  const reduced = useReducedMotion();
  const [contextLost, setContextLost] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault();
    setContextLost(true);
  }, []);

  if (contextLost) return null;

  const glProps = {
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance" as const,
    failIfMajorPerformanceCaveat: false,
  };

  if (isMobile) {
    return (
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={glProps}
        dpr={[1, 1.5]}
        style={{ touchAction: "pan-y" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", handleContextLost);
        }}
      >
        <Scene scrollDriven={false} />
      </Canvas>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={glProps}
      dpr={[1, 2]}
      style={{ touchAction: "pan-y" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", handleContextLost);
      }}
    >
      {reduced ? (
        <Scene scrollDriven={false} />
      ) : (
        <ScrollControls pages={0} style={{ touchAction: "pan-y" }}>
          <Scene scrollDriven />
        </ScrollControls>
      )}
    </Canvas>
  );
}
