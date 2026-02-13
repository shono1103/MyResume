import React from 'react';

type Props = {
  time?: React.ReactNode;
};

export function TimelineOpposite({time}: Props) {
  if (!time) return <div />;

  return (
    <div
      style={{
        paddingTop: 10,
        color: 'rgba(0,0,0,0.55)',
        fontSize: 13,
        whiteSpace: 'nowrap',
      }}
    >
      {time}
    </div>
  );
}
