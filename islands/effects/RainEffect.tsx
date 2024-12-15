import { useEffect } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";

export default function RainEffect(): JSX.Element {
	const makeItRain = (): void => {
		const rainContainer = globalThis.document.querySelector(
			".rain-container",
		);
		if (!rainContainer) return;

		rainContainer.innerHTML = "";

		let increment = 0;
		const drops: HTMLDivElement[] = [];

		while (increment < 100) {
			const randoHundo = Math.floor(
				Math.random() * (98 - 1 + 1) + 1,
			);
			const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
			increment += randoFiver;

			const drop = globalThis.document.createElement("div");
			drop.className = "drop";
			drop.style.left = `${increment}%`;
			drop.style.bottom = `${randoFiver + randoFiver - 1 + 100}%`;
			drop.style.animationDelay = `0.${randoHundo}s`;
			drop.style.animationDuration = `0.9${randoHundo}s`;

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
			drops.push(drop);
		}

		drops.forEach((drop) => rainContainer.appendChild(drop));
	};

	useEffect(() => {
		makeItRain();
	}, []);

	return <div class="rain-container"></div>;
}
