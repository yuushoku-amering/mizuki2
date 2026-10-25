import type { APIRoute } from "astro";
import {getSortedPosts} from "@utils/content-utils";
import {getPostUrl} from "@utils/url-utils";
import {initPostIdMap} from "@utils/permalink-utils";
import {getPostPublicDescription,shouldHidePostHomeContent} from "@utils/post-card-content";
import {projectsData} from "@/data/projects";

export const GET: APIRoute = async () => {
  const posts=(await getSortedPosts()).filter(post=>!post.data.draft);
  initPostIdMap(posts);
  const entries=[...posts.map(post=>({url:getPostUrl(post),title:post.data.title,label:post.data.category || "文章",text:getPostPublicDescription(post.data)+" "+((post.data.encrypted || post.data.password || shouldHidePostHomeContent(post.data)) ? "" : post.body || "")})),...projectsData.map(project=>({url:`/projects/${project.id}/`,title:project.title,label:"项目",text:project.description+" "+project.techStack.join(" ")}))];
  return new Response(JSON.stringify(entries),{headers:{"Content-Type":"application/json; charset=utf-8"}});
};
