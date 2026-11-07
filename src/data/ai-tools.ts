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
		id: "deepseek-harness",
		name: "DeepSeek Harness",
		description: { en: "Local agent for project discussions and collaboration.", zh_CN: "用于本地项目讨论、任务协作与资料整理。" },
		icon: "material-symbols:terminal",
		category: "coding",
		frequency: "daily",
		tags: ["Agent", "项目协作"],
	},
	{
		id: "codex",
		name: "Codex",
		description: { en: "Coding agent for implementation and verification.", zh_CN: "用于网站搭建、功能开发与改动验证。" },
		icon: "material-symbols:terminal",
		category: "coding",
		frequency: "daily",
		tags: ["Agent", "项目协作"],
	},
];
