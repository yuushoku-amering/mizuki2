// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "frontend" | "backend" | "database" | "tools" | "other";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	documents?: { name: string; path: string }[];
	color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
	// 数据分析技能
	{
		id: "spss",
		name: "SPSS",
		description:
			"专业统计软件，熟练运用SPSS进行调研与数据分析工作，包括数据清洗、描述统计、相关性检验、回归分析等多维度数据处理。",
		icon: "file-icons:spss",
		category: "other",
		level: "advanced",
		experience: { years: 2, months: 0 },
		projects: ["mathorcup-modeling", "market-research-project", "mangrove-ecological-survey"],
		color: "#1B5E96",
	},
	{
		id: "excel",
		name: "Excel",
		description:
			"精通Excel数据处理与分析功能，包括数据透视表、函数公式、图表制作，能够高效完成各类行政与数据统计工作。",
		icon: "vscode-icons:file-type-excel2",
		category: "tools",
		level: "advanced",
		experience: { years: 3, months: 0 },
		color: "#217346",
		documents: [
			{ name: "语料", path: "/documents/语料.xlsx" },
		],
	},
	{
		id: "sql",
		name: "SQL",
		description:
			"掌握SQL数据查询与操作，能够完成数据采集、清洗等基础数据处理工作。",
		icon: "vscode-icons:file-type-sql",
		category: "database",
		level: "beginner",
		experience: { years: 0, months: 6 },
		color: "#CC2927",
	},
	{
		id: "social-statistics",
		name: "社会统计学",
		description:
			"系统掌握社会统计学理论与方法，包括定量研究设计、抽样方法、假设检验、回归分析等，能够独立完成数据分析并输出结论。",
		icon: "material-symbols:functions",
		category: "other",
		level: "advanced",
		experience: { years: 2, months: 0 },
		projects: ["mathorcup-modeling", "market-research-project", "mangrove-ecological-survey"],
		color: "#7C3AED",
	},

	// 办公工具
	{
		id: "word",
		name: "Word",
		description:
			"熟练使用Word进行文档排版、报告撰写与行政文书处理，在文书规范化和标准化方面具有较丰富经验。",
		icon: "vscode-icons:file-type-word2",
		category: "tools",
		level: "advanced",
		experience: { years: 3, months: 0 },
		color: "#2B579A",
		documents: [
			{ name: "网络世界一个名字何以成为取消对话的标签", path: "/documents/网络世界一个名字何以成为取消对话的标签.docx" },
			{ name: "道德资本争夺与道德审判——互联网激进化转向的社会分析", path: "/documents/道德资本争夺与道德审判.docx" },
			{ name: "关于大学生群体近亲相恋伦理观的访谈", path: "/documents/关于大学生群体近亲相恋伦理观的访谈.docx" },
			{ name: "红树林保护区管理工作访谈", path: "/documents/红树林保护区管理工作访谈.docx" },
		],
	},
	{
		id: "powerpoint",
		name: "PowerPoint",
		description:
			"熟练使用PowerPoint进行演示文稿设计与制作，能够输出标准化的汇报材料，支持活动方案展示与成果汇报。",
		icon: "vscode-icons:file-type-powerpoint2",
		category: "tools",
		level: "advanced",
		experience: { years: 3, months: 0 },
		color: "#D24726",
		documents: [
			{ name: "23财秘学干培训PPT", path: "/documents/23财秘学干培训PPT.pptx" },
			{ name: "感知与意识", path: "/documents/感知与意识.pptx" },
		],
	},

	// AI/Agent 工具
	{
		id: "ccswitch",
		name: "CCSwitch",
		description:
			"熟练使用CCSwitch等Agent工具进行网站搭建与项目的辅助进行，提升开发与工作效率。",
		icon: "material-symbols:smart-toy",
		category: "tools",
		level: "intermediate",
		experience: { years: 0, months: 8 },
		projects: ["mizuki-website"],
		color: "#6366F1",
	},
	{
		id: "cherry-studio",
		name: "Cherry Studio",
		description:
			"熟练使用Cherry Studio等AI辅助工具进行项目协作与内容管理，能够利用Agent能力提升工作产出质量。",
		icon: "material-symbols:auto-awesome",
		category: "tools",
		level: "intermediate",
		experience: { years: 0, months: 8 },
		projects: ["mizuki-website"],
		color: "#EC4899",
	},

	// 设计工具
	{
		id: "photoshop",
		name: "Photoshop",
		description:
			"基本掌握Photoshop进行图片处理与编辑，可用于简单的图像优化与视觉素材制作。",
		icon: "logos:adobe-photoshop",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 6 },
		color: "#31A8FF",
	},
	{
		id: "after-effects",
		name: "After Effects",
		description:
			"基本掌握After Effects进行视频处理与动效制作，可用于简单的视频编辑与视觉内容创作。",
		icon: "logos:adobe-after-effects",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 4 },
		color: "#9999FF",
	},

	// 数据分析工具
	{
		id: "finebi",
		name: "FineBI",
		description:
			"熟练使用 FineBI 进行商业智能数据分析与可视化仪表板搭建，能够独立完成从数据接入、清洗建模到交互式仪表板输出的全流程，已取得 FCA 认证。",
		icon: "material-symbols:monitoring",
		category: "other",
		level: "intermediate",
		experience: { years: 0, months: 6 },
		projects: ["clothing-retail-dashboard"],
		certifications: ["FCA 认证（帆软认证工程师）"],
		color: "#1890FF",
	},

	// 研究方法
	{
		id: "quantitative-research",
		name: "定量研究",
		description:
			"系统掌握定量研究方法，包括问卷设计、抽样调查、统计分析、假设检验等，具备独立设计并执行量化研究项目的能力。",
		icon: "material-symbols:bar-chart",
		category: "other",
		level: "advanced",
		experience: { years: 2, months: 0 },
		projects: ["mathorcup-modeling", "market-research-project", "p2w-game-survey"],
		color: "#059669",
	},
	{
		id: "qualitative-research",
		name: "定性研究",
		description:
			"掌握定性研究方法，包括访谈法、观察法、内容分析等，能够设计访谈提纲并执行深度访谈，完成文字转写与结构化整理。",
		icon: "material-symbols:description",
		category: "other",
		level: "intermediate",
		experience: { years: 1, months: 6 },
		projects: ["mangrove-ecological-survey", "market-research-project"],
		color: "#DC2626",
	},
	{
		id: "survey-design",
		name: "问卷设计",
		description:
			"具备专业的问卷设计能力，能根据研究需求独立设计调研问卷与访谈提纲，保障调研内容的针对性与有效性。",
		icon: "material-symbols:edit-note",
		category: "other",
		level: "advanced",
		experience: { years: 2, months: 0 },
		projects: ["market-research-project", "mangrove-ecological-survey", "p2w-game-survey"],
		color: "#EA580C",
	},
];
