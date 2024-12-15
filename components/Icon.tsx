import type { JSX } from "preact/jsx-runtime";

interface IconProps {
	name: string;
	class?: string;
	style?: Record<string, string>;
}

export default function Icon(
	{ name, class: className, style }: IconProps,
): JSX.Element {
	const iconMap: Record<string, string> = {
		"mdi:twitter": "fa-brands fa-x-twitter",
		"mdi:github": "fa-brands fa-github",
	};

	return (
		<i
			class={`${iconMap[name] || ""} ${className || ""}`}
			style={style}
		/>
	);
}
