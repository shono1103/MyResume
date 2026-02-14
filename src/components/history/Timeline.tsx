import React from 'react';
import {TimelineCard} from './timeline/TimelineCard';
import {TimelineCenter} from './timeline/TimelineCenter';
import {TimelineOpposite} from './timeline/TimelineOpposite';

export type TimelineAlign = 'left' | 'alternate';
export type TimelineDotVariant = 'filled' | 'outlined';

export type TimelineItem = {
  id: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  tags?: string[];
  time?: React.ReactNode;
  icon?: React.ReactNode;
  dotColor?: string;
  dotVariant?: TimelineDotVariant;
};

type Props = {
  items: TimelineItem[];
  align?: TimelineAlign;
  lineColor?: string;
  lineWidth?: number;
  dotSize?: number;
  gapY?: number;
};

export function Timeline({
  items,
  align = 'alternate',
  lineColor = 'rgba(0,0,0,0.18)',
  lineWidth = 2,
  dotSize = 14,
  gapY = 18,
}: Props) {
  const isAlternate = align === 'alternate';
  const centerColWidth = Math.max(dotSize + 10, 26);

  return (
    <div style={{display: 'grid', rowGap: gapY}}>
      {items.map((it, idx) => {
        const leftSide = !isAlternate || idx % 2 === 0;
        const dotColor = it.dotColor ?? '#1976d2';
        const dotVariant = it.dotVariant ?? 'filled';

        const leftCell =
          isAlternate && !leftSide ? (
            <TimelineOpposite time={it.time} />
          ) : (
            <TimelineCard title={it.title} body={it.body} tags={it.tags} />
          );

        const rightCell =
          isAlternate && leftSide ? (
            <TimelineOpposite time={it.time} />
          ) : (
            <TimelineCard title={it.title} body={it.body} tags={it.tags} />
          );

        return (
          <div
            key={it.id}
            style={{
              display: 'grid',
              gridTemplateColumns:
                align === 'left'
                  ? `${centerColWidth}px 1fr`
                  : `1fr ${centerColWidth}px 1fr`,
              columnGap: 16,
              alignItems: 'stretch',
              minHeight: Math.max(dotSize + 8, 32),
            }}
          >
            {align === 'left' ? (
              <>
                <TimelineCenter
                  lineColor={lineColor}
                  lineWidth={lineWidth}
                  dotSize={dotSize}
                  dotColor={dotColor}
                  dotVariant={dotVariant}
                  icon={it.icon}
                />
                {rightCell}
              </>
            ) : (
              <>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <div style={{width: 'min(520px, 100%)'}}>{leftCell}</div>
                </div>

                <TimelineCenter
                  lineColor={lineColor}
                  lineWidth={lineWidth}
                  dotSize={dotSize}
                  dotColor={dotColor}
                  dotVariant={dotVariant}
                  icon={it.icon}
                />

                <div style={{display: 'flex', justifyContent: 'flex-start'}}>
                  <div style={{width: 'min(520px, 100%)'}}>{rightCell}</div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
