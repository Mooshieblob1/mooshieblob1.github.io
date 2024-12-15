import type { JSX } from "preact/jsx-runtime";
import RainEffect from "../islands/RainEffect.tsx";

export default function App(
	{ Component }: { Component: () => JSX.Element },
): JSX.Element {
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
				<RainEffect />
				<Component />
			</body>
		</html>
	);
}
