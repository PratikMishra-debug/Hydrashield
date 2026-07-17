import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { RISK_COLORS } from "../lib/floodModel";

// Deterministic pseudo-terrain height field (stand-in for real elevation/DEM data)
function terrainHeight(x, z) {
  return (
    Math.sin(x * 0.6) * 0.35 +
    Math.cos(z * 0.5) * 0.3 +
    Math.sin((x + z) * 0.3) * 0.25 -
    0.3
  );
}

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(10, 10, 60, 60);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, terrainHeight(x, y));
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#1B3C52" wireframe={false} flatShading />
    </mesh>
  );
}

function TerrainWireframe() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(10, 10, 30, 30);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, terrainHeight(x, y) + 0.01);
    }
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial color="#5FC9C9" wireframe transparent opacity={0.18} />
    </mesh>
  );
}

function WaterPlane({ level, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.y = level + Math.sin(t * 1.2) * 0.015;
      ref.current.material.opacity = 0.62 + Math.sin(t * 1.5) * 0.04;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, level, 0]}>
      <planeGeometry args={[10, 10, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.15}
        metalness={0.1}
        transmission={0.35}
      />
    </mesh>
  );
}

function RainParticles({ count, color }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = Math.random() * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= 0.08;
      if (arr[i * 3 + 1] < -0.5) arr[i * 3 + 1] = 5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color} transparent opacity={0.7} />
    </points>
  );
}

export default function FloodRisk3D({ probability = 20, level = "Low" }) {
  const color = RISK_COLORS[level] || RISK_COLORS.Low;
  // Water height mapped directly from the model's probability output —
  // this is the same number driving the gauge, just rendered spatially.
  const waterLevel = -0.35 + (probability / 100) * 0.85;
  const rainCount = level === "High" ? 900 : level === "Medium" ? 400 : 120;

  return (
    <div className="panel relative h-[420px] overflow-hidden">
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <p className="eyebrow">Spatial simulation</p>
        <p className="font-mono text-xs text-steel">
          water_level = f(probability) = -0.35 + (p/100)&nbsp;·&nbsp;0.85
        </p>
      </div>
      <Canvas camera={{ position: [5.5, 3.2, 5.5], fov: 42 }} shadows>
        <color attach="background" args={["#0B1E2D"]} />
        <fog attach="fog" args={["#0B1E2D", 8, 16]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
        <Terrain />
        <TerrainWireframe />
        <WaterPlane level={waterLevel} color={color} />
        <RainParticles count={rainCount} color="#5FC9C9" />
        <Environment preset="night" />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.6}
          enablePan={false}
          minDistance={5}
          maxDistance={11}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
