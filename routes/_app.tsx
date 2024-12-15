import type { JSX } from "preact/jsx-runtime";
import RainEffect from "../islands/effects/RainEffect.tsx";

export default function App(
	{ url, Component }: { url: URL; Component: () => JSX.Element },
): JSX.Element {
	const disableRainRoutes = ["/blog", "/images"];
	const showRain = !disableRainRoutes.some((route) =>
		url.pathname.startsWith(route)
	);

	return (
		<html>
			<head>
				<meta charset="utf-8" />
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="X-UA-Compatible" content="IE=edge" />
				<meta name="description" content="Am blob" />
				<meta property="og:title" content="Blob" />
				<meta property="og:description" content="Blob" />
				<meta property="og:image" content="~/assets/images/page.png" />
				<meta name="twitter:card" content="summary_large_image" />

				<title>Mooshieblob</title>
				<link rel="stylesheet" href="/css/styles.css" />
				<link
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
					rel="stylesheet"
					type="text/css"
				/>
				<link
					rel="icon"
					type="image/x-icon"
					href="icons/favicons/favicon.ico"
				/>
			</head>
			<body>
				{showRain && <RainEffect />}
				<Component />
			</body>
		</html>
	);
}
