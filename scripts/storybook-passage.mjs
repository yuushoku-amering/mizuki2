import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const assets = '<link rel="stylesheet" href="/storybook/passage.css"><script defer src="/storybook/passage.js"></script>';

// Portfolio pages are copied from public/ while the other routes are rendered
// by Astro. Install the same navigation effects in both sets of documents.
async function addPassage(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await addPassage(path);
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			const markup = await readFile(path, "utf8");
			if (markup.includes('src="/storybook/passage.js"')) continue;
			const result = markup.replace(/<head(?:\s[^>]*)?>/i, (head) => head + assets);
			if (result !== markup) await writeFile(path, result);
		}
	}
}

export default function storybookPassage() {
	return {
		name: "storybook-passage",
		hooks: {
			"astro:build:done": ({ dir }) => addPassage(fileURLToPath(dir)),
		},
	};
}
