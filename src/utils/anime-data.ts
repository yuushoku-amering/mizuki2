import fs from "node:fs";
import path from "node:path";

import localAnimeList from "../data/anime";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

export interface RawAnimeItem {
	title?: string;
	type?: string;
	cover?: string;
	link?: string;
	rating?: number | string;
	description?: string;
	year?: string;
	author?: string;
	genre?: string[];
}

export interface AnimeItem {
	title: string;
	type: string;
	cover: string;
	link: string;
	rating: number;
	description: string;
	year: string;
	author: string;
	genre: string[];
}

export type AnimeSourceConfig =
	| { type: "local"; data: AnimeItem[] }
	| {
			type: "json";
			filename: string;
			fetchOnDev?: boolean;
			emptyDescription?: string;
	  };

export function loadAnimeData(filename: string): AnimeItem[] {
	const dataPath = path.join(process.cwd(), `src/data/${filename}`);

	if (!fs.existsSync(dataPath)) {
		console.warn(`[Anime] Data file not found: ${dataPath}`);
		return [];
	}

	try {
		const fileContent = fs.readFileSync(dataPath, "utf-8");
		const rawData = JSON.parse(fileContent) as RawAnimeItem[];

		return rawData.map((item) => ({
			title: item.title || "Unknown",
			type: item.type || "anime",
			cover: item.cover || "",
			link: item.link || "",
			rating: Number(item.rating) || 0,
			description: item.description || "",
			year: item.year || "",
			author: item.author || "",
			genre: Array.isArray(item.genre) ? item.genre : [],
		}));
	} catch (error) {
		console.error(`[Anime] Failed to parse ${filename}:`, error);
		return [];
	}
}

export function getAnimeSourceConfigs(): Record<string, AnimeSourceConfig> {
	return {
		local: {
			type: "local",
			data: localAnimeList,
		},
		bilibili: {
			type: "json",
			filename: "bilibili-data.json",
			fetchOnDev: undefined,
			emptyDescription: i18n(I18nKey.animeEmptyBilibili),
		},
		bangumi: {
			type: "json",
			filename: "bangumi-data.json",
			fetchOnDev: undefined,
			emptyDescription: i18n(I18nKey.animeEmptyBangumi),
		},
	};
}

export function getAnimeList(
	mode: string,
	sourceConfigs: Record<string, AnimeSourceConfig>,
): { animeList: AnimeItem[]; currentConfig: AnimeSourceConfig | undefined } {
	let animeList: AnimeItem[] = [];
	const currentConfig = sourceConfigs[mode];

	if (currentConfig) {
		if (currentConfig.type === "local") {
			animeList = currentConfig.data;
		} else if (currentConfig.type === "json") {
			const isDev = import.meta.env.DEV;
			const shouldFetchOnDev = currentConfig.fetchOnDev ?? false;
			const skipLoad = isDev && !shouldFetchOnDev;

			if (skipLoad) {
				console.log(`[Dev] Skipping ${mode} data load (fetchOnDev is off).`);
				animeList = [];
			} else {
				animeList = loadAnimeData(currentConfig.filename);
			}
		}
	} else {
		console.warn(`[Anime] Unknown or unconfigured mode: ${mode}`);
	}

	return { animeList, currentConfig };
}

export function getStatusMap(): Record<
	string,
	{ text: string; class: string; icon: string }
> {
	return {
		all: {
			text: i18n(I18nKey.animeFilterAll),
			class: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
			icon: "📚",
		},
		anime: {
			text: "动漫",
			class: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
			icon: "📺",
		},
		manga: {
			text: "漫画",
			class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
			icon: "📖",
		},
		light_novel: {
			text: "轻小说",
			class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
			icon: "✨",
		},
		novel: {
			text: "小说",
			class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
			icon: "📕",
		},
	};
}
