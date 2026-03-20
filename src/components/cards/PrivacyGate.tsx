import { memo } from "preact/compat";

import { ViewportOverlay } from "@/components/layout/ViewportOverlay";
import { useI18n } from "@/i18n";

export const PrivacyGate = memo(function PrivacyGate({
	playerName,
	onReady,
}: {
	playerName: string;
	onReady: () => void;
}) {
	const { headingText, messages } = useI18n();

	return (
		<ViewportOverlay>
			<div className="privacy-screen">
				<div className="privacy-dialog text-center">
					<h2 className="privacy-title">{headingText(messages.common.passDevice)}</h2>
					<p className="privacy-subtitle">{messages.common.handDeviceTo}</p>
					<p className="privacy-name">{headingText(playerName)}</p>
					<button type="button" onClick={onReady} className="primary-action-button">
						{headingText(messages.common.ready)}
					</button>
				</div>
			</div>
		</ViewportOverlay>
	);
});
