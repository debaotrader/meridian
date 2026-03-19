'use client';
import { Line } from "@react-three/drei";
import type { VisualAgent } from "@/lib/office/types";
import { STATUS_COLORS } from "@/lib/office/constants";
import { position2dTo3d } from "@/lib/office/position-allocator";

interface ParentChildLineProps {
  parent: VisualAgent;
  child: VisualAgent;
}

export function ParentChildLine({ parent, child }: ParentChildLineProps) {
  const [px, , pz] = position2dTo3d(parent.position);
  const [cx, , cz] = position2dTo3d(child.position);
  const color = STATUS_COLORS[child.status] ?? "#60a5fa";

  return (
    <Line
      points={[
        [px, 0.5, pz],
        [cx, 0.5, cz],
      ]}
      color={color}
      lineWidth={1.5}
      dashed
      dashScale={2}
      dashSize={0.3}
      gapSize={0.2}
      transparent
      opacity={0.6}
    />
  );
}
