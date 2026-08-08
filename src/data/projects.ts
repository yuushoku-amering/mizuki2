// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "mizuki-website",
		title: "Mizuki 个人网站",
		description:
			"基于开源项目 Mizuki 搭建的个人网站，实现页面内容的定制化配置与功能扩展，用于展示个人简介、技能特长及项目经验，提升求职材料的完整性与多样性。",
		image: "/assets/projects/mizuki.webp",
		category: "web",
		techStack: ["Astro", "TypeScript", "Tailwind CSS", "EdgeOne", "GitHub"],
		status: "completed",
		sourceCode: "https://github.com/LyraVoid/Mizuki",
		visitUrl: "https://mizuki.mysqil.com",
		startDate: "2026-05-01",
		endDate: "2026-07-01",
		featured: true,
		tags: ["个人网站", "Astro", "前端", "博客"],
	},
	{
		id: "mathorcup-modeling",
		title: "MathorCup 数学建模竞赛",
		description:
			"独立完成全流程项目落地，包括医疗数据清洗、缺失值填充、异常值剔除等预处理工作，通过皮尔逊相关性检验挖掘高血脂症与生活习惯、基础病史等维度的关联特征，搭建逻辑回归预测模型实现患病风险分层，最终完成完整学术报告。",
		image: "",
		category: "other",
		techStack: ["SPSS", "Python", "逻辑回归", "数据分析", "学术写作"],
		status: "completed",
		startDate: "2026-04-01",
		endDate: "2026-04-30",
		featured: true,
		tags: ["数学建模", "医学数据", "竞赛", "华南赛区三等奖"],
		showImage: false,
	},
	{
		id: "market-research-project",
		title: "市场调查课程项目",
		description:
			"针对广东海洋大学周边「好想来」零食店开展市场调查。以问卷调查法为主获取学生消费行为与态度数据，以观察法为辅获取客观的店内运营数据，最终收集有效样本220份，通过数据分析回答好想来在学生消费领域的渗透情况，并对后续经营方向做出预测与建议。",
		image: "",
		category: "other",
		techStack: ["SPSS", "Excel", "问卷设计", "观察法", "市场分析"],
		status: "completed",
		startDate: "2026-06-01",
		endDate: "2026-06-30",
		tags: ["市场调查", "问卷设计", "数据分析", "课程项目"],
		showImage: false,
	},
	{
		id: "clothing-retail-dashboard",
		title: "服装零售数据仪表板",
		description:
			"基于 FineBI 搭建的服装零售数据分析仪表板。采用「人—货—场」零售分析框架，覆盖客户画像（性别/年龄结构、性别×年龄×销售额交叉分析、各年龄段销售贡献）、产品销售（品类占比、毛利额与毛利率、价格带分布）及经营地域（门店 TOP10、线上vs线下渠道、城市×春秋季销售）三个维度共 10 张工作表，样本量约 3.67 万笔交易、总销售额 354.41 万元，完整呈现从数据清洗到可视化仪表板的描述性分析全流程。",
		image: "",
		category: "other",
		techStack: ["FineBI", "Excel", "数据可视化", "零售分析", "描述统计"],
		status: "completed",
		liveDemo: "https://demo.fanruan.com/webroot/decision/link/8aRP",
		startDate: "2026-08-01",
		endDate: "2026-08-09",
		tags: ["FineBI", "仪表板", "零售分析", "人货场", "服装"],
		showImage: false,
	},
	{
		id: "mangrove-ecological-survey",
		title: "湛江金牛岛红树林生态治理调查",
		description:
			"根据研究需求独立设计调研问卷与访谈提纲，执行专员访谈工作，同步完成访谈录音的文字转写与结构化整理。负责问卷回收后的清洗、统计与多维度分析，提炼数据背后的核心特征与关联逻辑。独立完成政策导向类研究论文，聚焦现有生态多治理主体缺陷问题展开系统分析。",
		image: "",
		category: "other",
		techStack: ["访谈法", "问卷设计", "政策分析", "SPSS", "学术写作"],
		status: "completed",
		startDate: "2025-04-01",
		endDate: "2025-05-31",
		tags: ["生态治理", "社会调研", "红树林", "政策研究"],
		showImage: false,
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
