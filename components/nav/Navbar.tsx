import type { JSX } from "preact/jsx-runtime";

export default function Navbar(): JSX.Element {
	return (
		<nav class="fixed right-0 top-0 w-full bg-transparent p-4">
			<div class="container mx-auto flex items-center justify-end space-x-4">
				<div class="group relative">
					<a
						href="/blog"
						class="hover:glow text-white transition duration-700 hover:text-yellow-400"
					>
						Blog
					</a>
				</div>
				<div class="group relative">
					<a
						href="https://comfy.mooshieblob.com"
						class="hover:glow text-white transition duration-700 hover:text-yellow-400"
					>
						ComfyUI
					</a>
				</div>
				<div class="group relative">
					<a
						href="/images"
						class="hover:glow text-white transition duration-700 hover:text-yellow-400"
					>
						Images
					</a>
				</div>
			</div>
		</nav>
	);
}
