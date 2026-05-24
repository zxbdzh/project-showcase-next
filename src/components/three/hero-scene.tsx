"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

function Crystal({ scrollDriven }: { scrollDriven: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const data = useScroll();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (scrollDriven) {
      const offset = data.offset;
      meshRef.current.rotation.y = offset * Math.PI * 2;
      meshRef.current.rotation.x = offset * Math.PI * 0.5;
      meshRef.current.scale.setScalar(1 + offset * 0.3);
    } else {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.35, 64, 8, 2, 3]} />
      <meshStandardMaterial
        color="#4F46E5"
        metalness={0.7}
        roughness={0.2}
        emissive="#312E81"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function Scene({ scrollDriven }: { scrollDriven: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, -3, 2]} intensity={0.3} color="#818CF8" />
      <Crystal scrollDriven={scrollDriven} />
    </>
  );
}

export function HeroScene() {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault();
    setFailed(true);
  }, []);

  const handleError = useCallback(() => setFailed(true), []);

  if (failed) return null;

  const glProps = {
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance" as const,
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
        onError={handleError}
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
      onError={handleError}
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
