import type { JSX } from "preact/jsx-runtime";
import SocialLinks from "../components/SocialLinks.tsx";

export default function Home(): JSX.Element {
	return (
		<div class="index-content">
			<SocialLinks />
			<div class="back-row-toggle splat-toggle">
				<img
					id="bg_girl"
					src="/images/bg.webp"
					alt="Background Image"
					class="bg-girl"
				/>
			</div>
		</div>
	);
}
