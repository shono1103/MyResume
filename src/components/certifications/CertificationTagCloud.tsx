import React, {useEffect, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import TagCloud from 'TagCloud';
import styles from './certifications.module.css';
import type {CertificationEntry} from './certificationTypes';

type Props = {
  items: CertificationEntry[];
  onActiveIdChange: (id: string | null) => void;
};

const options = {
  radius: 180,
  maxSpeed: 'fast' as const,
  initSpeed: 'normal' as const,
  direction: 135,
  keep: true,
  useHTML: true,
  containerClass: 'cert-tagcloud',
  itemClass: 'cert-tagcloud-item',
  useContainerInlineStyles: true,
  useItemInlineStyles: true,
};

export default function CertificationTagCloud({items, onActiveIdChange}: Props) {
  const baseUrl = useBaseUrl('/');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tagCloudInstance = useRef<ReturnType<typeof TagCloud> | null>(null);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) {
      return;
    }

    function buildAssetUrl(path: string): string {
      return `${baseUrl.replace(/\/$/, '')}${path}`;
    }

    const tagContents = items.map(
      (item) =>
        `<span class="cert-cloud-token" data-cert-id="${item.id}"><img src="${buildAssetUrl(item.svg_path)}" alt="${item.name}" /></span>`,
    );

    if (tagCloudInstance.current && 'destroy' in tagCloudInstance.current) {
      tagCloudInstance.current.destroy();
    }

    tagCloudInstance.current = TagCloud(containerRef.current, tagContents, options);

    const rootEl = containerRef.current;

    function handleHoverOrFocus(event: Event) {
      const target = event.target as HTMLElement | null;
      const token = target?.closest<HTMLElement>('[data-cert-id]');
      if (!token) {
        return;
      }

      onActiveIdChange(token.dataset.certId ?? null);
    }

    function clearActive() {
      onActiveIdChange(null);
    }

    rootEl.addEventListener('mouseover', handleHoverOrFocus);
    rootEl.addEventListener('focusin', handleHoverOrFocus);
    rootEl.addEventListener('mouseleave', clearActive);
    rootEl.addEventListener('focusout', clearActive);

    return () => {
      rootEl.removeEventListener('mouseover', handleHoverOrFocus);
      rootEl.removeEventListener('focusin', handleHoverOrFocus);
      rootEl.removeEventListener('mouseleave', clearActive);
      rootEl.removeEventListener('focusout', clearActive);
      if (tagCloudInstance.current && 'destroy' in tagCloudInstance.current) {
        tagCloudInstance.current.destroy();
        tagCloudInstance.current = null;
      }
    };
  }, [baseUrl, items, onActiveIdChange]);

  return <div ref={containerRef} className={styles.cloudStage} />;
}
