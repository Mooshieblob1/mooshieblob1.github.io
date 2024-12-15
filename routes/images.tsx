import type { PageProps } from "$fresh/server.ts";
import type { JSX } from "preact/jsx-runtime";
import ImageGallery from "../islands/ImageGallery.tsx";

export default function ImagesPage(_props: PageProps): JSX.Element {
	return (
		<div class="min-h-screen bg-slate-950 p-8">
			<div class="mx-auto mb-12 mt-12">
				<a href="/">
					<img
						src="/images/bloblogo.webp"
						alt="logo"
						class="mx-auto h-[10vw] w-auto cursor-pointer logo"
						style="filter: drop-shadow(0 0 0.75rem rgba(255, 255, 0, 0.3));"
					/>
				</a>
			</div>
			<div class="container mx-auto">
				<ImageGallery />
			</div>
		</div>
	);
}
