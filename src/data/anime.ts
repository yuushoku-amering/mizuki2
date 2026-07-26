// 喜欢的作品（动漫 / 漫画 / 轻小说 / 小说）
export type WorkType = "anime" | "manga" | "light_novel" | "novel";

export interface AnimeItem {
	title: string;
	type: WorkType;
	rating: number;
	cover: string;
	description: string;
	year: string;
	genre: string[];
	author: string;       // 作者 / 制作公司
	link: string;
}

const localAnimeList: AnimeItem[] = [
	// ===== 漫画 =====
	{
		title: "午夜心旋律",
		type: "manga",
		rating: 8.5,
		cover: "/assets/anime/mayonaka-heart-tune.webp",
		description: "寻找电台主播「阿波罗」的少年，邂逅四位声音相似的广播社美少女。五十岚正邦笔下甜度爆表的校园恋爱喜剧。",
		year: "2023",
		genre: ["恋爱", "校园", "喜剧"],
		author: "五十岚正邦",
		link: "https://bgm.tv/subject/498263",
	},
	{
		title: "白圣女与黑牧师",
		type: "manga",
		rating: 8.5,
		cover: "/assets/anime/saint-cecilia.webp",
		description: "迟钝圣女×木头牧师的同居恋爱物语。两人之间若即若离的甜蜜日常，看得人嘴角疯狂上扬。",
		year: "2017",
		genre: ["恋爱", "日常", "治愈"],
		author: "和武叶佐乃",
		link: "https://bgm.tv/subject/269682",
	},
	{
		title: "童话般的你展开恋爱猛攻",
		type: "manga",
		rating: 8,
		cover: "/assets/anime/otogi-koi.webp",
		description: "社会人×高中女生，早已两情相悦的两人之间温馨又甜蜜的恋爱攻防战。和武叶佐乃另一力作。",
		year: "2021",
		genre: ["恋爱", "日常", "治愈"],
		author: "和武叶佐乃",
		link: "https://bgm.tv/subject/324836",
	},

	// ===== 轻小说 =====
	{
		title: "春宵苦短，少女前进吧！",
		type: "light_novel",
		rating: 9.8,
		cover: "/assets/anime/yoruwa-mijikashi.webp",
		description: "京都一夜，少女的奇想冒险。森见登美彦将夜晚的街道变成绚烂的童话世界——天马行空的想象力与纯粹的恋爱能量扑面而来。",
		year: "2006",
		genre: ["奇幻", "恋爱", "青春"],
		author: "森见登美彦",
		link: "https://bgm.tv/subject/35062",
	},
	{
		title: "四叠半神话大系",
		type: "light_novel",
		rating: 9.3,
		cover: "/assets/anime/jojohan.webp",
		description: "如果当初选择了不同的社团，人生会是怎样？平行宇宙式的叙事下，是对青春可能性与玫瑰色校园生活的终极追问。",
		year: "2004",
		genre: ["奇幻", "校园", "哲学"],
		author: "森见登美彦",
		link: "https://bgm.tv/subject/43690",
	},

	// ===== 小说 =====
	{
		title: "挪威的森林",
		type: "novel",
		rating: 9.5,
		cover: "/assets/anime/norwegian-wood.webp",
		description: "青春、爱情与死亡的残酷物语。村上以细腻笔触描绘出迷失与孤独中生长的爱，读完后久久无法抽离。",
		year: "1987",
		genre: ["爱情", "青春", "文学"],
		author: "村上春树",
		link: "https://bgm.tv/subject/14091",
	},
];

export default localAnimeList;
