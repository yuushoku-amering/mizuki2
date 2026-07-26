// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	手机: [
		{
			name: "Redmi Note 12 Turbo",
			image: "/images/device/redmi-note12turbo.webp",
			specs: "高通骁龙7+ Gen 2 / 16G + 1TB",
			description: "日常主力机，性能足够、存储管饱。",
			link: "https://www.mi.com/redmi-note-12-turbo",
		},
	],
	电脑: [
		{
			name: "机械革命 蛟龙16 Pro",
			image: "/images/device/jiaolong16pro.webp",
			specs: "AMD Ryzen / RTX 4060 / Windows 11",
			description: "主力游戏与开发设备，3A大作+竞技网游全在这台跑。",
			link: "https://www.mechrevo.com/",
		},
	],
	键盘: [
		{
			name: "瓦尔基里 VK99 吕卟",
			image: "/images/device/vk99.webp",
			specs: "99键 / 机械轴",
			description: "日常主力键盘。",
			link: "https://www.valkyrie.com/",
		},
		{
			name: "黑爵 AK029",
			image: "/images/device/ak029.webp",
			specs: "机械轴",
			description: "备用键盘。",
			link: "https://www.aJazz.com/",
		},
	],
	鼠标: [
		{
			name: "瓦尔基里 M1 吕卟",
			image: "/images/device/vk-m1.webp",
			specs: "轻量化 / 无线",
			description: "主力游戏鼠标。",
			link: "https://www.valkyrie.com/",
		},
		{
			name: "瓦尔基里 M5 梅林",
			image: "/images/device/vk-m5.webp",
			specs: "轻量化 / 无线",
			description: "备用游戏鼠标。",
			link: "https://www.valkyrie.com/",
		},
	],
	耳机: [
		{
			name: "竹林鸟 夜莺",
			image: "/images/device/zhulinniao-yeying.webp",
			specs: "入耳式 / 有线",
			description: "日常听歌用，性价比好塞。",
			link: "",
		},
		{
			name: "原道姬",
			image: "/images/device/yuandaoji.webp",
			specs: "平头塞 / 有线",
			description: "悔恨之泪，几块钱的快乐。",
			link: "",
		},
		{
			name: "黑猫线",
			image: "/images/device/heimao-cable.webp",
			specs: "耳机升级线",
			description: "耳机换线用。",
			link: "",
		},
		{
			name: "DB2",
			image: "/images/device/db2.webp",
			specs: "入耳式",
			description: "",
			link: "",
		},
		{
			name: "觅声 双子座",
			image: "/images/device/misheng-gemini.webp",
			specs: "入耳式 / 有线",
			description: "",
			link: "",
		},
		{
			name: "绯乐 涟二",
			image: "/images/device/feile-lian2.webp",
			specs: "入耳式 / 有线",
			description: "",
			link: "",
		},
	],
};
