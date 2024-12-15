import type { Handlers, PageProps } from "$fresh/server.ts";
import { extract } from "@std/front-matter/any";
import { marked } from "marked";
import type { JSX } from "preact/jsx-runtime";
import BlogPosts from "../islands/BlogPosts.tsx";

const POSTS_PER_PAGE = 5;

export interface BlogPost {
	id: number;
	path: string;
	title: string;
	excerpt?: string;
	content: string;
}

export const handler: Handlers<{ posts: BlogPost[]; hasMore: boolean }> = {
	GET(req, ctx): Response | Promise<Response> {
		const url = new URL(req.url);
		const page = parseInt(url.searchParams.get("page") || "1");
		const posts: BlogPost[] = [];

		const blogFiles = [...Deno.readDirSync("static/content/blog")];
		for (const blogFile of blogFiles) {
			if (blogFile.isFile && blogFile.name.endsWith(".md")) {
				const content = Deno.readTextFileSync(
					`static/content/blog/${blogFile.name}`,
				);
				const { attrs, body } = extract(content);
				const markedContent = marked.parse(body);

				posts.push({
					id: parseInt(blogFile.name.split("-")[0] || "0"),
					path: blogFile.name.replace(".md", ""),
					title: (attrs as { title?: string }).title || "Untitled",
					excerpt: (attrs as { excerpt?: string }).excerpt || "",
					content: String(markedContent),
				});
			}
		}

		posts.sort((a, b) => b.id - a.id);

		const start = (page - 1) * POSTS_PER_PAGE;
		const end = start + POSTS_PER_PAGE;
		const paginatedPosts = posts.slice(start, end);
		const hasMore = end < posts.length;

		const accept = req.headers.get("accept");
		if (accept?.includes("application/json")) {
			return new Response(
				JSON.stringify({
					posts: paginatedPosts,
					hasMore,
					total: posts.length,
					currentPage: page,
				}),
				{
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-cache",
					},
				},
			);
		}

		return ctx.render({ posts: paginatedPosts, hasMore });
	},
};

export default function BlogPage(
	{ data, url }: PageProps<{ posts: BlogPost[]; hasMore: boolean }>,
): JSX.Element {
	return (
		<div class="min-h-screen bg-gray-900 p-8">
			<div class="mx-auto max-w-4xl">
				<div class="mx-auto mb-12 mt-12">
					<a href="/">
						<img
							src="/images/bloblogo.webp"
							alt="logo"
							class="mx-auto h-[5vw] w-auto logo"
							style="filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));"
						/>
					</a>
				</div>
				<h1 class="mb-8 text-center text-4xl font-bold text-yellow-400">
					Blog
				</h1>

				<BlogPosts
					initialPosts={data.posts}
					baseUrl={url.pathname}
				/>
			</div>
		</div>
	);
}
