import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ 
  width = '100%', 
  height = '16px', 
  borderRadius = 'var(--radius-sm)', 
  className = '', 
  style 
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        display: 'block',
        ...style
      }}
    />
  );
}

interface SkeletonCardProps {
  rows?: number;
  style?: React.CSSProperties;
}

export function SkeletonCard({ rows = 3, style }: SkeletonCardProps) {
  return (
    <div className="glass-card skeleton-card-loading" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
      <Skeleton width="40%" height="20px" borderRadius="var(--radius-sm)" style={{ marginBottom: '8px' }} />
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton 
          key={idx} 
          width={idx === rows - 1 ? '60%' : '100%'} 
          height="14px" 
        />
      ))}
    </div>
  );
}
