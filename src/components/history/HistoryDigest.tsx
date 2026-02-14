import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { load as parseYaml } from 'js-yaml';

type Props = {
	className: string;
	titleClassName: string;
	summaryClassName: string;
	metaClassName: string;
	buttonClassName: string;
};

type HistoryItem = {
	id: string;
	time?: string;
	title: string;
	details?: string[];
};

type HistoryYaml = {
	timeline: HistoryItem[];
};

export default function HistoryDigest({
	className,
	titleClassName,
	summaryClassName,
	metaClassName,
	buttonClassName,
}: Props) {
	const configPath = useBaseUrl('/data/history.yml');
	const [item, setItem] = useState<HistoryItem | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function load() {
			try {
				const response = await fetch(configPath);
				if (!response.ok) {
					return;
				}

				const parsed = parseYaml(await response.text()) as HistoryYaml;
				const timeline = parsed?.timeline ?? [];
				if (timeline.length === 0) {
					return;
				}

				const current = timeline.find((entry) => entry.id === 'now') ?? timeline[timeline.length - 1];
				if (isMounted) {
					setItem(current);
				}
			} catch {
				// Ignore digest fetch errors and keep fallback UI.
			}
		}

		load();
		return () => {
			isMounted = false;
		};
	}, [configPath]);

	const title = item ? (item.title.toLowerCase() === 'now' ? '現在' : item.title) : 'Timeline item';
	const summary = item?.time ?? 'Career timeline digest';
	const details = item?.details?.join(' / ');

	return (
		<article className={className}>
			<h3 className={titleClassName}>現在</h3>
			<p className={summaryClassName}>{title}</p>
			<p className={metaClassName}>{summary}</p>
			{details ? <p className={metaClassName}>{details}</p> : null}
			<Link className={buttonClassName} to="/history">
				view more
			</Link>
		</article>
	);
}
