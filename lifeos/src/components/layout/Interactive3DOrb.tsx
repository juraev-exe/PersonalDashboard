import React, { useEffect, useRef } from 'react';

interface Interactive3DOrbProps {
  size?: number;
  particleCount?: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function Interactive3DOrb({
  size = 280,
  particleCount = 120,
  color = '#3fb950',
  style
}: Interactive3DOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    interface Point3D {
      x: number;
      y: number;
      z: number;
      origX: number;
      origY: number;
      origZ: number;
    }

    const points: Point3D[] = [];
    const radius = size * 0.38;

    // Distribute points on sphere using Fibonacci spiral
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      points.push({ x, y, z, origX: x, origY: y, origZ: z });
    }

    let angleX = 0.003;
    let angleY = 0.003;
    let currentAngleX = angleX;
    let currentAngleY = angleY;

    let isRunning = true;

    const draw = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, size, size);

      const mouse = mouseRef.current;
      if (mouse.isHovered) {
        // Accelerate and tilt towards mouse coordinate
        const targetAngleX = (mouse.y - size / 2) * 0.00012;
        const targetAngleY = (mouse.x - size / 2) * 0.00012;
        currentAngleX += (targetAngleX - currentAngleX) * 0.15;
        currentAngleY += (targetAngleY - currentAngleY) * 0.15;
      } else {
        // Return to constant idle rotation
        currentAngleX += (angleX - currentAngleX) * 0.05;
        currentAngleY += (angleY - currentAngleY) * 0.05;
      }

      points.forEach(p => {
        // Rotate Y
        const cosY = Math.cos(currentAngleY);
        const sinY = Math.sin(currentAngleY);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        const cosX = Math.cos(currentAngleX);
        const sinX = Math.sin(currentAngleX);
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // 3D Projection
        const perspective = 300;
        const scale = perspective / (perspective + p.z);
        const projX = p.x * scale + size / 2;
        const projY = p.y * scale + size / 2;

        const pSize = Math.max(1, scale * 1.6);
        const alpha = Math.min(1, Math.max(0.1, 0.45 + (p.z / radius) * 0.45));
        
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(projX, projY, pSize, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby points
        points.forEach(other => {
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dz = p.z - other.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 46 && dist > 0) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = (1 - dist / 46) * 0.06 * alpha;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            const oScale = perspective / (perspective + other.z);
            const oProjX = other.x * oScale + size / 2;
            const oProjY = other.y * oScale + size / 2;
            ctx.lineTo(oProjX, oProjY);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = mouseRef.current;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      mouseRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovered = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isRunning = false;
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [size, particleCount, color]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: size, 
        height: size, 
        display: 'block',
        cursor: 'crosshair',
        ...style 
      }} 
    />
  );
}
