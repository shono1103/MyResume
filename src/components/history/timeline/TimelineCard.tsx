import React from 'react';

type Props = {
  title: React.ReactNode;
  body?: React.ReactNode;
  tags?: string[];
};

export function TimelineCard({title, body, tags}: Props) {
  const hasTags = Boolean(tags && tags.length > 0);

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
      <div style={{fontWeight: 700, marginBottom: body || hasTags ? 8 : 0}}>{title}</div>
      {body ? (
        <div style={{color: 'rgba(0,0,0,0.72)', fontSize: 14}}>{body}</div>
      ) : null}
      {hasTags ? (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: body ? 10 : 0}}>
          {tags?.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.14)',
                background: 'rgba(0,0,0,0.03)',
                color: 'rgba(0,0,0,0.72)',
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
