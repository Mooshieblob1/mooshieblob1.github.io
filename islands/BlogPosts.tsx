import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { BlogPost } from "../routes/blog.tsx";

interface BlogPostsProps {
	initialPosts: BlogPost[];
	baseUrl: string;
}

export default function BlogPosts(
	{ initialPosts, baseUrl }: BlogPostsProps,
): JSX.Element {
	const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [expandedPost, setExpandedPost] = useState<BlogPost | null>(null);
	const [scrolling, setIsScrolling] = useState(false);
	const observerTarget = useRef<HTMLDivElement>(null);
	const scrollTimer = useRef<number | null>(null);

	const handleScroll = () => {
		setIsScrolling(true);
		if (scrollTimer.current) {
			clearTimeout(scrollTimer.current);
		}
		scrollTimer.current = setTimeout(() => {
			setIsScrolling(false);
		}, 1000);
	};

	const fetchMorePosts = async () => {
		if (loading || !hasMore) return;

		setLoading(true);
		try {
			const nextPage = page + 1;
			const url = new URL(baseUrl, globalThis.location.origin);
			url.searchParams.set("page", nextPage.toString());

			const response = await fetch(url, {
				headers: {
					"Accept": "application/json",
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.posts.length === 0) {
				setHasMore(false);
			} else {
				setPosts((prev) => [...prev, ...data.posts]);
				setPage(nextPage);
				setHasMore(data.hasMore);
			}
		} catch (error) {
			console.error("unable to fetch posts:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const observer = new globalThis.IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && !loading && hasMore) {
					fetchMorePosts();
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px 200px 0px" },
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		globalThis.addEventListener("scroll", handleScroll);

		return () => {
			observer.disconnect();
			globalThis.removeEventListener("scroll", handleScroll);
			if (scrollTimer.current) clearTimeout(scrollTimer.current);
		};
	}, [loading, hasMore]);

	useEffect(() => {
		if (expandedPost) {
			globalThis.document.body.style.overflow = "hidden";
			globalThis.document.body.style.paddingRight = "8px";
		} else {
			globalThis.document.body.style.overflow = "";
			globalThis.document.body.style.paddingRight = "";
		}
	}, [expandedPost]);

	useEffect(() => {
		if (scrolling) {
			globalThis.document.body.classList.add("is-scrolling");
		} else {
			globalThis.document.body.classList.remove("is-scrolling");
		}
	}, [scrolling]);

	return (
		<>
			<div class="space-y-6">
				{posts.map((post) => (
					<div
						key={post.path}
						class="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-lg p-6 transition-all duration-300 hover:shadow-xl"
					>
						<div class="cursor-pointer" onClick={() => setExpandedPost(post)}>
							<h2 class="mb-2 text-2xl font-semibold text-yellow-300">
								{post.title}
							</h2>
							{post.excerpt && (
								<p class="mb-4 text-gray-300 preview-text">
									{post.excerpt}
								</p>
							)}
							<div class="flex items-center justify-between">
								<span class="text-yellow-200 hover:text-yellow-100 transition-colors duration-200">
									Read more
								</span>
							</div>
						</div>
					</div>
				))}

				{loading && (
					<div class="mt-4 text-center text-gray-300">
						Loading more posts...
					</div>
				)}

				{!hasMore && posts.length > 0 && (
					<div class="mt-4 text-center text-gray-300">
						No more posts to load
					</div>
				)}

				<div ref={observerTarget} class="h-10 w-full" />
			</div>

			{expandedPost && (
				<div
					class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
					onClick={() => setExpandedPost(null)}
				>
					<div
						class="my-8 w-[90vw] max-w-4xl rounded-lg bg-gray-800 p-8"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 class="mb-4 text-3xl font-bold text-yellow-300">
							{expandedPost.title}
						</h2>
						<div
							class="mb-6 text-gray-300"
							dangerouslySetInnerHTML={{ __html: expandedPost.content }}
						/>
						<button
							onClick={() => setExpandedPost(null)}
							class="rounded bg-yellow-400 px-4 py-2 text-gray-900 hover:bg-yellow-300"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
}
