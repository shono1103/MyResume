import React from 'react';
import type {TimelineDotVariant} from '../Timeline';

type Props = {
  lineColor: string;
  lineWidth: number;
  dotSize: number;
  dotColor: string;
  dotVariant: TimelineDotVariant;
  icon?: React.ReactNode;
};

export function TimelineCenter({
  lineColor,
  lineWidth,
  dotSize,
  dotColor,
  dotVariant,
  icon,
}: Props) {
  const dotStyle: React.CSSProperties =
    dotVariant === 'filled'
      ? {background: dotColor, border: `2px solid ${dotColor}`}
      : {background: '#fff', border: `2px solid ${dotColor}`};

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        width: '100%',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: lineWidth,
          background: lineColor,
          borderRadius: 999,
        }}
      />
      <div
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          zIndex: 1,
          ...dotStyle,
        }}
      >
        {icon ? (
          <div
            style={{
              fontSize: Math.max(10, Math.floor(dotSize * 0.7)),
              lineHeight: 1,
              color: dotVariant === 'filled' ? '#fff' : dotColor,
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
