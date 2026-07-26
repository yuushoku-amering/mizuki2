// 友情链接 → 个人推荐工具与资源
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "八爪鱼采集器",
		imgurl: "/assets/friend-logos/bazhuayu.png",
		desc: "网页数据自动采集工具，做调研和爬数据用",
		siteurl: "https://www.bazhuayu.com/",
		tags: ["数据采集", "调研"],
	},
	{
		id: 2,
		title: "DeepSeek",
		imgurl: "https://www.google.com/s2/favicons?domain=deepseek.com&sz=64",
		desc: "好用",
		siteurl: "https://chat.deepseek.com/",
		tags: ["AI", "对话助手"],
	},
	{
		id: 3,
		title: "FineBI",
		imgurl: "/assets/friend-logos/finebi.png",
		desc: "帆软出品的数据分析与可视化工具",
		siteurl: "https://www.finebi.com/",
		tags: ["数据分析", "可视化"],
	},
	{
		id: 4,
		title: "CCSwitch",
		imgurl: "https://www.google.com/s2/favicons?domain=ccswitch.dev&sz=64",
		desc: "AI Agent 辅助工具，网站搭建与项目协作的好搭档，提升开发效率",
		siteurl: "https://ccswitch.dev/",
		tags: ["AI", "Agent"],
	},
	{
		id: 5,
		title: "Cherry Studio",
		imgurl: "https://www.google.com/s2/favicons?domain=cherry-ai.com&sz=64",
		desc: "AI 桌面客户端，集成多模型对话与 Agent 能力，项目协作与内容管理的效率利器",
		siteurl: "https://cherry-ai.com/",
		tags: ["AI", "效率"],
	},
	{
		id: 6,
		title: "Pixiv",
		imgurl: "https://www.google.com/s2/favicons?domain=pixiv.net&sz=64",
		desc: "日本最大的插画创作分享平台，找图的宝藏之地",
		siteurl: "https://www.pixiv.net/",
		tags: ["插画", "创作"],
	},
	{
		id: 7,
		title: "网易云音乐",
		imgurl: "/assets/friend-logos/netease-music.png",
		desc: "听歌放松用",
		siteurl: "https://music.163.com/",
		tags: ["音乐", "日常"],
	},
	{
		id: 8,
		title: "GitHub",
		imgurl: "/assets/friend-logos/github.png",
		desc: "全球最大的代码托管平台，开源项目与协作开发的聚集地",
		siteurl: "https://github.com",
		tags: ["开发", "开源项目"],
	},
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
