import gameList, { gameStats, type GameCategory, type GameItem } from "../data/games";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

export type { GameCategory, GameItem };

export interface CategoryInfo {
	text: string;
	class: string;
	icon: string;
}

export function getCategoryMap(): Record<string, CategoryInfo> {
	return {
		all: {
			text: i18n(I18nKey.gamesFilterAll),
			class: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
			icon: "🎮",
		},
		singleplayer: {
			text: i18n(I18nKey.gamesCategorySingleplayer),
			class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
			icon: "🎯",
		},
		competitive: {
			text: i18n(I18nKey.gamesCategoryCompetitive),
			class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
			icon: "🔥",
		},
		gacha: {
			text: i18n(I18nKey.gamesCategoryGacha),
			class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
			icon: "💎",
		},
		browser: {
			text: i18n(I18nKey.gamesCategoryBrowser),
			class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
			icon: "🖥️",
		},
		mobile: {
			text: i18n(I18nKey.gamesCategoryMobile),
			class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
			icon: "📱",
		},
	};
}

export function getGameList(): GameItem[] {
	return gameList;
}

export function getGameStats() {
	return {
		...gameStats,
		totalGames: gameList.length,
		categoryCounts: {
			singleplayer: gameList.filter((g) => g.category === "singleplayer").length,
			competitive: gameList.filter((g) => g.category === "competitive").length,
			gacha: gameList.filter((g) => g.category === "gacha").length,
			browser: gameList.filter((g) => g.category === "browser").length,
			mobile: gameList.filter((g) => g.category === "mobile").length,
		},
		proficientCount: gameList.filter((g) => g.isProficient).length,
	};
}
