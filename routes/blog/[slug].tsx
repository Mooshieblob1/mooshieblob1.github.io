import type { Handlers, PageProps } from "$fresh/server.ts";
import { extract } from "@std/front-matter/any";
import { marked } from "marked";
import type { JSX } from "preact/jsx-runtime";

interface BlogPost {
	title: string;
	excerpt?: string;
	content: string;
}

export const handler: Handlers<BlogPost> = {
	GET(_req, ctx): Response | Promise<Response> {
		const { slug } = ctx.params;

		try {
			const content = Deno.readFileSync(`static/content/blog/${slug}.md`);
			const textContent = new TextDecoder().decode(content);
			const { attrs, body } = extract(textContent);

			const renderedContent = marked.parse(body);

			return ctx.render({
				title: (attrs as { title?: string }).title || "Untitled",
				excerpt: (attrs as { excerpt?: string }).excerpt || "",
				content: renderedContent.toString(),
			});
		} catch {
			return ctx.renderNotFound();
		}
	},
};

export default function BlogPost({ data }: PageProps<BlogPost>): JSX.Element {
	return (
		<div class="min-h-screen bg-gray-900 p-8">
			<div class="mx-auto max-w-4xl">
				<h1 class="mb-8 text-4xl font-bold text-yellow-400">{data.title}</h1>
				{data.excerpt && <p class="mb-6 text-gray-300">{data.excerpt}</p>}
				<div
					class="prose prose-invert max-w-none"
					dangerouslySetInnerHTML={{ __html: data.content }}
				/>
			</div>
		</div>
	);
}
