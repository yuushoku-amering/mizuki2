// 作品集数据配置
// 对应 F:\ppt\吕家欣 用户研究作品集.pptx 的 21 页幻灯片（已导出为图片）

export interface PortfolioSlide {
	n: number;
	src: string;
	caption: string;
}

export interface PortfolioPart {
	id: string;
	numeral: string; // 壹 贰 叁 肆
	title: string;
	subtitle: string;
	color: string; // 四季主题色
	slides: PortfolioSlide[];
}

const slide = (n: number, caption: string): PortfolioSlide => ({
	n,
	src: `/assets/portfolio/slide-${n}.webp`,
	caption,
});

// 封面
export const portfolioCover: PortfolioSlide = slide(1, "用户研究作品集 · 封面");

// 目录
export const portfolioCatalog: PortfolioSlide = slide(2, "目录 · 四部分结构");

// 四季四部分
export const portfolioParts: PortfolioPart[] = [
	{
		id: "p2w",
		numeral: "壹",
		title: "游戏付费即赢公平感知调查",
		subtitle: "春 · 樱花",
		color: "#C47A8F",
		slides: [
			slide(3, "第一部分 · 游戏付费即赢公平感知调查"),
			slide(4, "大学生游戏消费公平感知调查研究 · 概述"),
			slide(5, "研究框架 · 五维度消费公平感知"),
			slide(6, "审美驱动与期望落差 · 消费动机"),
			slide(7, "核心发现 · 从 Pay to Win 到 Pay to Lose"),
			slide(8, "反思与优化方向"),
		],
	},
	{
		id: "snack",
		numeral: "贰",
		title: "好想来零食店消费者研究",
		subtitle: "夏 · 菊花",
		color: "#E8A317",
		slides: [
			slide(9, "第二部分 · 好想来零食店消费者研究"),
			slide(10, "好想来零食店消费者行为研究 · 概述"),
			slide(11, "消费行为 · 高频有限、结伴为主、顺路驱动"),
			slide(12, "核心洞察 · 零食消费作为社交「副产物」"),
			slide(13, "交叉验证 & 商业建议"),
		],
	},
	{
		id: "apparel",
		numeral: "叁",
		title: "服饰零售销售情况数据分析",
		subtitle: "秋 · 枫叶",
		color: "#C0413A",
		slides: [
			slide(14, "第三部分 · 服饰零售销售情况数据分析"),
			slide(15, "服饰零售数据可视化分析报告 · 概述"),
			slide(16, "核心发现 · 人货场框架"),
			slide(17, "FineBI 仪表板 · 三组件联动与运营建议"),
		],
	},
	{
		id: "others",
		numeral: "肆",
		title: "其余项目 · 访谈与数据建模分析",
		subtitle: "冬 · 梅花",
		color: "#B878A0",
		slides: [
			slide(18, "第四部分 · 其余项目"),
			slide(19, "红树林社区共治 · 定性研究"),
			slide(20, "高血脂症风险预警 · 数学建模"),
		],
	},
];

// 结尾
export const portfolioThanks: PortfolioSlide = slide(21, "感谢您的观看");
