import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface ImageData {
	id: number;
	fileUrl: string;
	tagString: string;
	mediaAsset: {
		variants: Array<{
			type: string;
			url: string;
			width: number;
			height: number;
		}>;
	};
}

interface ImageGalleryProps {
	initialImages?: ImageData[];
}

export default function ImageGallery(
	{ initialImages = [] }: ImageGalleryProps,
): JSX.Element {
	const [images, setImages] = useState<ImageData[]>(initialImages);
	const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [enlargedImageLoaded, setEnlargedImageLoaded] = useState(false);
	const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
	const [imageInView, setImageInView] = useState<boolean[]>([]);
	const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

	const isValidImageData = (data: unknown): data is ImageData[] => {
		return Array.isArray(data) && data.every((item) =>
			item &&
			typeof item.id === "number" &&
			typeof item.file_url === "string" &&
			typeof item.tag_string === "string" &&
			item.media_asset?.variants?.length > 0
		);
	};

	const fetchImages = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				"https://nameless-moon-1f3f.kentvuong88-cloudflare.workers.dev/",
			);
			const rawData = await response.json();

			// hacky workaround for 'camelCase->snake_case'
			const data = rawData.map((
				item: {
					file_url: string;
					tag_string: string;
					media_asset: {
						variants: Array<
							{ type: string; url: string; width: number; height: number }
						>;
					};
				},
			) => ({
				...item,
				fileUrl: item.file_url,
				tagString: item.tag_string,
				mediaAsset: {
					...item.media_asset,
				},
			}));
			if (!isValidImageData(data)) {
				throw new Error("invalid image data format");
			}

			setImages(data);
			setLoadedImages(new Array(data.length).fill(false));
			setImageInView(new Array(data.length).fill(false));
		} catch (error) {
			console.error("unable to fetch images:", error);
			setImages([]);
		} finally {
			setIsLoading(false);
		}
	};

	const onImageLoad = (index: number, image: ImageData) => {
		setLoadedImages((prev) => {
			const newState = [...prev];
			newState[index] = true;
			return newState;
		});
		cacheImage(image.id, image.fileUrl);
	};

	const cacheImage = (id: number, url: string) => {
		localStorage.setItem(`cachedImage_${id}`, url);
	};

	const getCachedImageUrl = (id: number) => {
		return localStorage.getItem(`cachedImage_${id}`);
	};

	useEffect(() => {
		fetchImages();

		const observer = new globalThis.IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const index = parseInt(
						entry.target.getAttribute("data-index") || "0",
					);

					setImageInView((prev) => {
						const newState = [...prev];
						newState[index] = entry.isIntersecting;
						return newState;
					});
				});
			},
			{ threshold: 0.1, rootMargin: "100px" },
		);

		return () => observer.disconnect();
	}, []);

	return (
		<div>
			<p class="pb-4 text-center">
				This is a smaller selection of my SFW posts. To see more, go{"  "}
				<a
					href="https://aibooru.online/posts?tags=user%3ABlob"
					target="_blank"
					rel="noopener noreferrer"
					class="underline"
				>
					<strong>here</strong>
				</a>.
			</p>

			{isLoading
				? (
					<div class="flex h-64 items-center justify-center">
						<div class="spinner" />
					</div>
				)
				: (
					<div class="image-grid">
						{images.map((image, index) => {
							const variant = image?.mediaAsset?.variants?.find((v) =>
								v.type === "preview"
							) || image?.mediaAsset?.variants?.[0];
							return variant?.url
								? (
									<div
										key={image.id}
										class="image-item"
										onClick={() => {
											setSelectedImage(image);
											setEnlargedImageLoaded(false);
										}}
									>
										<div
											ref={(el) => (imageRefs.current[index] = el)}
											data-index={index}
											class="h-full"
										>
											<img
												src={variant.url}
												alt={image.tagString}
												class={`transform transition-all duration-1000 ease-out ${
													loadedImages[index] ? "loaded" : ""
												} ${
													imageInView[index] ? "translate-y-0 opacity-100" : ""
												}`}
												onLoad={() =>
													onImageLoad(index, image)}
											/>
										</div>
									</div>
								)
								: null;
						})}
					</div>
				)}

			{selectedImage && (
				<div
					class="image-overlay"
					onClick={() => setSelectedImage(null)}
				>
					{!enlargedImageLoaded && <div class="spinner" />}
					<img
						src={getCachedImageUrl(selectedImage.id) || selectedImage.fileUrl}
						alt={selectedImage.tagString}
						class={`enlarged-image ${enlargedImageLoaded ? "loaded" : ""}`}
						onLoad={() => setEnlargedImageLoaded(true)}
					/>
				</div>
			)}
		</div>
	);
}
