import React, { useEffect, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { load as parseYaml } from 'js-yaml';
import styles from './intro.module.css';
import HistoryDigest from '../history/HistoryDigest';
import { BaseInfoCard, Card, CuriousCard, EmailCard, HobbyCard, MottoCard, SkillsCard } from './IntroCards';
import type { IntroData, IntroYamlConfig } from './introTypes';

type Props = {
	configPath: string;
};

export default function IntroFromYaml({ configPath }: Props) {
	const baseUrl = useBaseUrl('/');
	const resolvedConfigPath = useBaseUrl(configPath);
	const [intro, setIntro] = useState<IntroData | null>(null);
	const [lastUpdate, setLastUpdate] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadConfig() {
			try {
				const response = await fetch(resolvedConfigPath);
				if (!response.ok) {
					throw new Error(`Failed to fetch config: ${response.status}`);
				}

				const raw = await response.text();
				const parsed = parseYaml(raw) as IntroYamlConfig;

				if (!parsed?.intro) {
					throw new Error('Invalid config format: intro is required');
				}

				if (isMounted) {
					setIntro(parsed.intro);
					setLastUpdate(parsed.last_update ?? '');
					setError(null);
				}
			} catch (e) {
				if (isMounted) {
					setError(e instanceof Error ? e.message : 'Unknown error');
				}
			}
		}

		loadConfig();

		return () => {
			isMounted = false;
		};
	}, [resolvedConfigPath]);

	if (error) {
		return <p>Intro data could not be loaded: {error}</p>;
	}

	if (!intro) {
		return <p>Loading intro...</p>;
	}

	const normalizedIntro: IntroData = {
		...intro,
		base_info: intro.base_info.map((item) => ({
			...item,
			profile_img_path: `${baseUrl.replace(/\/$/, '')}${item.profile_img_path}`,
		})),
	};

	return (
		<div className={styles.hero}>
			<div className={styles.container}>
				<div className={styles.stack}>
					<div className={styles.topRow}>
						<BaseInfoCard intro={normalizedIntro}>
							<HistoryDigest
								className={styles.digestCard}
								titleClassName={styles.digestTitle}
								summaryClassName={styles.digestSummary}
								metaClassName={styles.digestMeta}
								buttonClassName={styles.digestButton}
							/>
						</BaseInfoCard>
						<div className={styles.sideStack}>
							<EmailCard email={normalizedIntro.email} />
							<MottoCard motto={normalizedIntro.motto} />
						</div>
					</div>

					<div className={styles.threeColRow}>
						<HobbyCard hobbies={normalizedIntro.hobby} />
						<SkillsCard intro={normalizedIntro} />
						<CuriousCard fields={normalizedIntro.curious_fields} />
					</div>

				</div>
			</div>
		</div>
	);
}
