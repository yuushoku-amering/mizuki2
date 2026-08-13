import gameList, { gameStats, type PrimaryCategory, type GameItem } from "../data/games";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

export type { PrimaryCategory, GameItem };

export interface CategoryInfo {
	text: string;
	class: string;
	icon: string;
}

/** Level 1（商业模式）分类映射 */
export function getPrimaryCategoryMap(): Record<string, CategoryInfo> {
	return {
		all: {
			text: i18n(I18nKey.gamesFilterAll),
			class: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
			icon: "🎮",
		},
		featured: {
			text: i18n(I18nKey.gamesPrimaryFeatured),
			class: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
			icon: "💖",
		},
		competitive: {
			text: i18n(I18nKey.gamesPrimaryCompetitive),
			class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
			icon: "🔥",
		},
		gacha: {
			text: i18n(I18nKey.gamesPrimaryGacha),
			class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
			icon: "💎",
		},
		singleplayer: {
			text: i18n(I18nKey.gamesPrimarySingleplayer),
			class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
			icon: "🎯",
		},
		mobile: {
			text: i18n(I18nKey.gamesPrimaryMobile),
			class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
			icon: "📱",
		},
		browser: {
			text: i18n(I18nKey.gamesPrimaryBrowser),
			class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
			icon: "🖥️",
		},
	};
}

/** Level 2（玩法类型）子分类定义 — 按一级分类返回不同的子类型集合 */
function getSubcategoryDefs(): Record<string, Record<string, { i18nKey: string; icon: string; class: string }>> {
	return {
		competitive: {
			fps:    { i18nKey: "gamesSecondaryFps",    icon: "🔫", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
			tps:    { i18nKey: "gamesSecondaryTps",    icon: "🎯", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
			moba:   { i18nKey: "gamesSecondaryMoba",   icon: "⚔️", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
			battleroyale: { i18nKey: "gamesSecondaryBattleroyale", icon: "🪂", class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
			fighting: { i18nKey: "gamesSecondaryFighting", icon: "🥊", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
		},
		gacha: {
			openworld: { i18nKey: "gamesSecondaryOpenWorld", icon: "🌍", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
			action:    { i18nKey: "gamesSecondaryAction",    icon: "💥", class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
			rpg:       { i18nKey: "gamesSecondaryRpg",       icon: "🗡️", class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
			strategy:  { i18nKey: "gamesSecondaryStrategy",  icon: "🧠", class: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
			card:      { i18nKey: "gamesSecondaryCard",      icon: "🃏", class: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
			tps:       { i18nKey: "gamesSecondaryTpsGacha",  icon: "🔫", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
		},
		singleplayer: {
			openworld:  { i18nKey: "gamesSecondaryOpenWorld",  icon: "🌍", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
			action:     { i18nKey: "gamesSecondaryAction",     icon: "💥", class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
			rpg:        { i18nKey: "gamesSecondaryRpg",        icon: "🗡️", class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
			simulation: { i18nKey: "gamesSecondarySimulation", icon: "🏗️", class: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
			rhythm:     { i18nKey: "gamesSecondaryRhythm",     icon: "🎵", class: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
			visualnovel:{ i18nKey: "gamesSecondaryVisualNovel",icon: "📖", class: "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300" },
		},
		mobile: {
			moba: { i18nKey: "gamesSecondaryMoba", icon: "⚔️", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
			fps:  { i18nKey: "gamesSecondaryFps",  icon: "🔫", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
		},
		browser: {
			rpg:    { i18nKey: "gamesSecondaryRpg",    icon: "🗡️", class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
			action: { i18nKey: "gamesSecondaryAction", icon: "💥", class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
		},
	};
}

/** 根据一级分类获取对应的 Level 2 子类型映射（含"全部"） */
export function getSecondaryCategoryMap(primary: string): Record<string, CategoryInfo> {
	const defs = getSubcategoryDefs();
	const subDefs = defs[primary];
	if (!subDefs) return {};

	const map: Record<string, CategoryInfo> = {
		all: {
			text: i18n(I18nKey.gamesFilterAll),
			class: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
			icon: "🎮",
		},
	};
	for (const [key, def] of Object.entries(subDefs)) {
		map[key] = {
			text: i18n(I18nKey[def.i18nKey as keyof typeof I18nKey]),
			class: def.class,
			icon: def.icon,
		};
	}
	return map;
}

/** 获取所有二级分类定义中实际使用的 i18n key 列表（用于批量翻译） */
export function getAllSecondaryI18nKeys(): string[] {
	const defs = getSubcategoryDefs();
	const keys = new Set<string>();
	for (const primary of Object.values(defs)) {
		for (const def of Object.values(primary)) {
			keys.add(def.i18nKey);
		}
	}
	return Array.from(keys);
}

export function getGameList(): GameItem[] {
	return gameList;
}

export function getGameStats() {
	return {
		...gameStats,
		totalGames: gameList.length,
		categoryCounts: {
			competitive: gameList.filter((g) => g.primaryCategory === "competitive").length,
			gacha: gameList.filter((g) => g.primaryCategory === "gacha").length,
			singleplayer: gameList.filter((g) => g.primaryCategory === "singleplayer").length,
			mobile: gameList.filter((g) => g.primaryCategory === "mobile").length,
			browser: gameList.filter((g) => g.primaryCategory === "browser").length,
		},
		proficientCount: gameList.filter((g) => g.isProficient).length,
	};
}
