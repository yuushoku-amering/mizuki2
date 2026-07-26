export type AIToolCategory =
	| "chat"
	| "coding"
	| "image"
	| "audio"
	| "video"
	| "writing"
	| "search"
	| "other";

export type AIToolFrequency =
	| "daily"
	| "weekly"
	| "occasional"
	| "experimental";

export type LocaleString = Partial<
	Record<"en" | "zh_CN" | "zh_TW" | "ja", string>
>;

export function getLocaleString(value: LocaleString, lang: string): string {
	return value[lang as keyof LocaleString] ?? value["en"] ?? "";
}

export interface AITool {
	id: string;
	name: string;
	description: LocaleString;
	icon: string;
	category: AIToolCategory;
	frequency: AIToolFrequency;
	url?: string;
	usage?: LocaleString;
	tags?: string[];
	color?: string;
}

// Replace the examples below with your own AI tools
export const aiToolsData: AITool[] = [
	{
		id: "deepseek",
		name: "DeepSeek",
		description: {
			en: "Cost-effective conversational AI with strong reasoning and coding capabilities.",
			zh_CN: "高性价比的对话式 AI，推理与编码能力强，日常主力使用。",
		},
		icon: "material-symbols:smart-toy",
		category: "chat",
		frequency: "daily",
		url: "https://chat.deepseek.com/",
		usage: {
			en: "Daily: writing, research, problem solving",
			zh_CN: "每天：写作、查资料、问题求解",
		},
		tags: ["对话", "推理"],
		color: "#4D6BFE",
	},
	{
		id: "ccswitch",
		name: "CCSwitch",
		description: {
			en: "AI Agent assistant for website development and project collaboration — boosts dev efficiency.",
			zh_CN: "AI Agent 辅助工具，网站搭建与项目协作的好搭档，提升开发效率。",
		},
		icon: "material-symbols:terminal",
		category: "coding",
		frequency: "daily",
		url: "https://ccswitch.dev/",
		usage: {
			en: "Daily: website building, project scaffolding",
			zh_CN: "每天：网站搭建、项目构建",
		},
		tags: ["Agent", "开发"],
		color: "#6366F1",
	},
	{
		id: "cherry-studio",
		name: "Cherry Studio",
		description: {
			en: "Multi-model AI desktop client with integrated Agent capabilities, great for project collaboration and content management.",
			zh_CN: "AI 桌面客户端，集成多模型对话与 Agent 能力，项目协作与内容管理的效率利器。",
		},
		icon: "material-symbols:computer",
		category: "chat",
		frequency: "daily",
		url: "https://cherry-ai.com/",
		usage: {
			en: "Daily: multi-model chat, content management, project work",
			zh_CN: "每天：多模型对话、内容管理、项目协作",
		},
		tags: ["AI", "效率", "Agent"],
		color: "#EC4899",
	},
];
