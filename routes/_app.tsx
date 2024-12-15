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
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<title>Mooshieblob</title>
				<link rel="stylesheet" href="/css/styles.css" />
				<link
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
					rel="stylesheet"
					type="text/css"
				/>
			</head>
			<body>
				{showRain && <RainEffect />}
				<Component />
			</body>
		</html>
	);
}
