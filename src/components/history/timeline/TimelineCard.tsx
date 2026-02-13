import React from 'react';

type Props = {
  title: React.ReactNode;
  body?: React.ReactNode;
};

export function TimelineCard({title, body}: Props) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 14,
        padding: '12px 14px',
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{fontWeight: 700, marginBottom: body ? 6 : 0}}>{title}</div>
      {body ? (
        <div style={{color: 'rgba(0,0,0,0.72)', fontSize: 14}}>{body}</div>
      ) : null}
    </div>
  );
}
