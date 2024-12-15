import { useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";

export default function RainEffect(): JSX.Element {
	const frontRowRef = useRef<HTMLDivElement>(null);
	const backRowRef = useRef<HTMLDivElement>(null);

	const makeItRain = (): void => {
		if (!frontRowRef.current || !backRowRef.current) return;

		let increment = 0;
		const frontDrops: HTMLDivElement[] = [];
		const backDrops: HTMLDivElement[] = [];

		while (increment < 100) {
			const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
			const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
			increment += randoFiver;

			const frontDrop = globalThis.document.createElement("div");
			frontDrop.className = "drop";
			frontDrop.style.left = `${increment}%`;
			frontDrop.style.bottom = `${randoFiver + randoFiver - 1 + 100}%`;
			frontDrop.style.animationDelay = `0.${randoHundo}s`;
			frontDrop.style.animationDuration = `0.9${randoHundo}s`;

			const backDrop = globalThis.document.createElement("div");
			backDrop.className = "drop";
			backDrop.style.right = `${increment}%`;
			backDrop.style.bottom = `${randoFiver + randoFiver - 1 + 100}%`;
			backDrop.style.animationDelay = `0.${randoHundo}s`;
			backDrop.style.animationDuration = `0.9${randoHundo}s`;

			[frontDrop, backDrop].forEach((drop) => {
				const stem = globalThis.document.createElement("div");
				stem.className = "stem";
				stem.style.animationDelay = `0.${randoHundo}s`;
				stem.style.animationDuration = `0.9${randoHundo}s`;

				const splat = globalThis.document.createElement("div");
				splat.className = "splat";
				splat.style.animationDelay = `0.${randoHundo}s`;
				splat.style.animationDuration = `0.9${randoHundo}s`;

				drop.appendChild(stem);
				drop.appendChild(splat);
			});

			frontDrops.push(frontDrop);
			backDrops.push(backDrop);
		}

		frontDrops.forEach((drop) => frontRowRef.current?.appendChild(drop));
		backDrops.forEach((drop) => backRowRef.current?.appendChild(drop));
	};

	useEffect(() => {
		makeItRain();
		const interval = setInterval(makeItRain, 20000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div class="rain-container">
			<div ref={frontRowRef} class="rain front-row" />
			<div ref={backRowRef} class="rain back-row" />
		</div>
	);
}
