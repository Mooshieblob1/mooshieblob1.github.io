import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

(async () => {
	await dev(import.meta.url, "./main.ts", config);
})();
