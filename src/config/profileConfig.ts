import type { ProfileConfig } from "../types/config";

// 个人资料配置
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/雨月忍.jpg", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
	name: "吕家欣",
	bio: "社会学本科生 | 数据分析与用户研究 | 广东海洋大学",
	typewriter: {
		enable: true, // 启用个人简介打字机效果
		speed: 80, // 打字速度（毫秒）
	},
	links: [
		{
			name: "电子邮箱",
			icon: "material-symbols:mail",
			url: "mailto:2330704234@qq.com",
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/matsuzaka-yuki",
		},
	],
};
