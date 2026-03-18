import { registerSW } from "virtual:pwa-register";

registerSW({
	immediate: true,
	onOfflineReady() {
		console.info("Secret Hitler is ready to work offline.");
	},
	onRegisteredSW(swUrl, registration) {
		if (!registration) return;
		console.info(`PWA service worker registered: ${swUrl}`);
	},
});
