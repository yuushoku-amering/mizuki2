import type { FullscreenWallpaperConfig } from "../types/config";

export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	enable: true,
	src: {
		desktop: [
			"/images/backgrounds/1.jpg",
			"/images/backgrounds/2.jpg",
			"/images/backgrounds/3.jpg",
			"/images/backgrounds/4.jpg",
			"/images/backgrounds/5.jpg",
			"/images/backgrounds/6.jpg",
			"/images/backgrounds/7.jpg",
			"/images/backgrounds/8.jpg",
		],
		mobile: [
			"/images/backgrounds/1.jpg",
			"/images/backgrounds/2.jpg",
			"/images/backgrounds/3.jpg",
			"/images/backgrounds/4.jpg",
			"/images/backgrounds/5.jpg",
			"/images/backgrounds/6.jpg",
			"/images/backgrounds/7.jpg",
			"/images/backgrounds/8.jpg",
		],
	},
	position: "center",
	carousel: {
		enable: true,
		interval: 5,
	},
	zIndex: -1,
	opacity: 0.8,
	blur: 1,
	switchable: true,
	overlay: {
		opacity: 0.8, // 壁纸不透明度，0-1
		blur: 1.5, // 背景模糊半径（px）
		cardOpacity: 0.8, // 卡片不透明度，0-1
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
	},
	fullscreen: {
		switchable: {
			opacity: true,
			blur: true,
		},
	},
};
