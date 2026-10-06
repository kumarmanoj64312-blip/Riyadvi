"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Network as NetworkData } from "@/three/utils/network";
import { palette } from "@/lib/theme";

/*
 * Scratch objects allocated ONCE at module load and reused every frame.
 * Creating Vector3/Matrix4 inside useFrame would generate garbage 60×/s and
 * trigger GC pauses (visible stutter).
 */
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _rotation = new THREE.Quaternion();

const NODE_RADIUS = 0.05;
const COLOR_NODE = new THREE.Color(palette.gold).multiplyScalar(0.8);
const COLOR_NODE_HOT = new THREE.Color(palette.goldLight).multiplyScalar(1.6);
const COLOR_NODE_NEIGHBOUR = new THREE.Color(palette.goldLight);
const COLOR_EDGE = new THREE.Color(palette.goldDark).multiplyScalar(0.55);
const COLOR_EDGE_HOT = new THREE.Color(palette.goldLight);

type Props = { network: NetworkData; reducedMotion: boolean };

/**
 * The connected nodes of the hero ecosystem.
 *
 * - ALL nodes are one InstancedMesh → 1 draw call instead of ~110.
 * - ALL connections are one LineSegments → 1 more draw call.
 * - Hovering a node lights it, its neighbours and the links between them:
 *   "every part of the business is connected". Highlighting writes straight
 *   into GPU buffers on hover change only — no React state, no re-render.
 */
export function Network({ network, reducedMotion }: Props) {
  const { count, positions, edges, adjacency, sizes } = network;
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Mutable per-frame state lives in a ref: it changes outside React's render
  // cycle (pointer events, useFrame), so it must not be state or a memo value.
  const simRef = useRef({
    hovered: -1,
    scale: new Float32Array(0), // current animated scale per node
    neighbour: new Uint8Array(0), // 1 = connected to the hovered node
  });

  // Line geometry: each edge = two endpoints copied from the node positions.
  const lineBuffers = useMemo(() => {
    const pos = new Float32Array(edges.length * 3);
    const col = new Float32Array(edges.length * 3);
    for (let v = 0; v < edges.length; v++) {
      pos.set(positions.subarray(edges[v] * 3, edges[v] * 3 + 3), v * 3);
      COLOR_EDGE.toArray(col, v * 3);
    }
    return { pos, col };
  }, [edges, positions]);

  // Initial instance matrices + colours (runs once per network).
  useLayoutEffect(() => {
    simRef.current = { hovered: -1, scale: Float32Array.from(sizes), neighbour: new Uint8Array(count) };
    const mesh = nodesRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      _position.fromArray(positions, i * 3);
      _scale.setScalar(sizes[i]);
      mesh.setMatrixAt(i, _matrix.compose(_position, _rotation, _scale));
      mesh.setColorAt(i, COLOR_NODE);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere(); // needed for correct raycasting/culling
  }, [count, positions, sizes]);

  /** Recolours nodes + edges for a new hover target (-1 = none). */
  function highlight(id: number) {
    const mesh = nodesRef.current;
    const lines = linesRef.current;
    if (!mesh || !lines) return;
    const sim = simRef.current;
    const colorAttr = lines.geometry.getAttribute("color") as THREE.BufferAttribute;

    sim.neighbour.fill(0);
    for (let v = 0; v < edges.length; v++) COLOR_EDGE.toArray(colorAttr.array, v * 3);

    if (id >= 0) {
      for (const e of adjacency[id]) {
        const other = edges[e * 2] === id ? edges[e * 2 + 1] : edges[e * 2];
        sim.neighbour[other] = 1;
        COLOR_EDGE_HOT.toArray(colorAttr.array, e * 2 * 3);
        COLOR_EDGE_HOT.toArray(colorAttr.array, (e * 2 + 1) * 3);
      }
    }
    for (let i = 0; i < count; i++) {
      mesh.setColorAt(i, i === id ? COLOR_NODE_HOT : sim.neighbour[i] ? COLOR_NODE_NEIGHBOUR : COLOR_NODE);
    }
    colorAttr.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    sim.hovered = id;
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId ?? -1;
    if (id !== simRef.current.hovered) {
      highlight(id);
      document.body.style.cursor = id >= 0 ? "pointer" : "";
    }
  };
  const onPointerLeave = () => {
    highlight(-1);
    document.body.style.cursor = "";
  };

  // Animate node scale toward its target (hovered/neighbour nodes swell).
  // Only nodes whose scale actually changes get their matrix rewritten.
  useFrame((_, delta) => {
    const mesh = nodesRef.current;
    const sim = simRef.current;
    if (!mesh || sim.scale.length !== count) return;
    const dt = Math.min(delta, 0.1);
    const speed = reducedMotion ? 30 : 8; // reduced motion → near-instant
    let dirty = false;

    for (let i = 0; i < count; i++) {
      const boost = i === sim.hovered ? 2.2 : sim.neighbour[i] ? 1.45 : 1;
      const target = sizes[i] * boost;
      const current = sim.scale[i];
      if (Math.abs(target - current) < 0.001) continue;
      sim.scale[i] = THREE.MathUtils.damp(current, target, speed, dt);
      _position.fromArray(positions, i * 3);
      _scale.setScalar(sim.scale[i]);
      mesh.setMatrixAt(i, _matrix.compose(_position, _rotation, _scale));
      dirty = true;
    }
    if (dirty) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, count]}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <icosahedronGeometry args={[NODE_RADIUS, 1]} />
        {/* White base: the per-instance colour supplies the gold tint. */}
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.7}
          roughness={0.25}
          emissive={palette.goldDark}
          emissiveIntensity={0.35}
        />
      </instancedMesh>

      <lineSegments ref={linesRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineBuffers.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineBuffers.col, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.7} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
