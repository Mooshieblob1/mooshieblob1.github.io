import { type Signal, signal } from "@preact/signals";

export function useRainEffect(): {
	showRainEffect: Signal<boolean>;
	toggleRainEffect: (value: boolean) => void;
} {
	const showRainEffect = signal<boolean>(true);

	const toggleRainEffect = (value: boolean): void => {
		showRainEffect.value = value;
	};

	return {
		showRainEffect,
		toggleRainEffect,
	};
}
