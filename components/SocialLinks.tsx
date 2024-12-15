import type { JSX } from "preact/jsx-runtime";
import BlobLogo from "./BlobLogo.tsx";
import Icon from "./Icon.tsx";

export default function SocialLinks(): JSX.Element {
	return (
		<div class="social-links flex">
			<BlobLogo />
			<div class="social-icons flex">
				<a
					href="https://safe.aibooru.online/posts?tags=user%3ABlob"
					target="_blank"
					rel="noopener"
					class="mr-2"
				>
					<img
						src="/icons/aibooru.svg"
						alt="AIBooru"
						class="social-icon"
						style={{
							marginTop: "4px",
							width: "35px",
							height: "35px",
						}}
					/>
				</a>
				<a
					href="https://x.com/mooshieblob"
					target="_blank"
					rel="noopener"
					class="mr-2"
				>
					<Icon
						name="mdi:twitter"
						class="social-icon"
						style={{ color: "text-yellow-400", fontSize: "35px" }}
					/>
				</a>
				<a
					href="https://github.com/Mooshieblob1/"
					target="_blank"
					rel="noopener"
					class="mr-2"
				>
					<Icon
						name="mdi:github"
						class="social-icon"
						style={{ color: "text-yellow-400", fontSize: "35px" }}
					/>
				</a>
			</div>
		</div>
	);
}
