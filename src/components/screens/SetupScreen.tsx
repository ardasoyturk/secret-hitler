import { GripVertical, Trash2, UserPlus } from "lucide-preact";
import type { TargetedKeyboardEvent, TargetedPointerEvent } from "preact";
import { memo, useCallback, useReducer, useRef } from "preact/compat";

import { MIN_PLAYERS, MAX_PLAYERS, PORTRAITS } from "@/engine/constants";
import type { GameState, GameAction, Player } from "@/engine/types";
import { useI18n } from "@/i18n";
import type { AppLanguage } from "@/i18n";

const PLAYER_COLOR_STYLES: Record<string, string> = {
	red: "border-player-red",
	blue: "border-player-blue",
	green: "border-player-green",
	yellow: "border-player-yellow",
	purple: "border-player-purple",
	orange: "border-player-orange",
	pink: "border-player-pink",
	teal: "border-player-teal",
	brown: "border-player-brown",
	gray: "border-player-gray",
};

const LANGUAGE_OPTIONS: AppLanguage[] = ["en", "tr"];

interface ScreenProps {
	state: GameState;
	dispatch: (action: GameAction) => void;
}

interface SetupUiState {
	name: string;
	selectedPortrait: number;
	showPortraitPicker: boolean;
	draggingPlayerId: number | null;
	dropTargetPlayerId: number | null;
}

type SetupUiAction =
	| { type: "name/set"; value: string }
	| { type: "portrait/select"; index: number }
	| { type: "portrait/toggle" }
	| { type: "portrait/close" }
	| { type: "player/added"; nextPortrait: number }
	| { type: "drag/start"; playerId: number }
	| { type: "drag/hover"; playerId: number }
	| { type: "drag/end" };

const INITIAL_UI_STATE: SetupUiState = {
	name: "",
	selectedPortrait: 0,
	showPortraitPicker: false,
	draggingPlayerId: null,
	dropTargetPlayerId: null,
};

function setupUiReducer(state: SetupUiState, action: SetupUiAction): SetupUiState {
	switch (action.type) {
		case "name/set":
			return { ...state, name: action.value };
		case "portrait/select":
			return {
				...state,
				selectedPortrait: action.index,
				showPortraitPicker: false,
			};
		case "portrait/toggle":
			return { ...state, showPortraitPicker: !state.showPortraitPicker };
		case "portrait/close":
			return { ...state, showPortraitPicker: false };
		case "player/added":
			return {
				...state,
				name: "",
				selectedPortrait: action.nextPortrait,
				showPortraitPicker: false,
			};
		case "drag/start":
			return {
				...state,
				draggingPlayerId: action.playerId,
				dropTargetPlayerId: action.playerId,
			};
		case "drag/hover":
			return { ...state, dropTargetPlayerId: action.playerId };
		case "drag/end":
			return {
				...state,
				draggingPlayerId: null,
				dropTargetPlayerId: null,
			};
		default:
			return state;
	}
}

function getNextPortraitIndex(players: Player[], selectedPortrait: number): number {
	const usedIndices = new Set([...players.map((player) => player.portraitIndex), selectedPortrait]);
	const nextPortrait = PORTRAITS.findIndex((_, index) => !usedIndices.has(index));
	return nextPortrait >= 0 ? nextPortrait : 0;
}

const LanguageSelector = memo(function LanguageSelector() {
	const { language, setLanguage, messages } = useI18n();

	return (
		<section className="mb-4 rounded-[var(--radius-panel)] border border-white/8 bg-black/18 px-4 py-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="section-label">{messages.language.label}</p>
				<div className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-white/10 bg-black/20 p-1">
					{LANGUAGE_OPTIONS.map((option) => {
						const isActive = option === language;
						const label = messages.language.options[option];
						return (
							<button
								key={option}
								type="button"
								onClick={() => setLanguage(option)}
								aria-label={messages.language.buttonLabel(label)}
								aria-pressed={isActive}
								className={[
									"relative min-w-[5.5rem] px-3.5 py-1.5 text-sm font-medium transition-all duration-150 rounded-[calc(var(--radius-button)-2px)]",
									isActive ? "text-gold" : "text-text-muted hover:text-text-secondary cursor-pointer",
								].join(" ")}
							>
								{isActive && <span className="bg-gold absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full" />}
								{label}
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
});

const PlayerSetupPanel = memo(function PlayerSetupPanel({
	players,
	playerCount,
	name,
	selectedPortrait,
	showPortraitPicker,
	trimmedName,
	isDuplicate,
	canAdd,
	canStart,
	onNameChange,
	onNameKeyDown,
	onTogglePortraitPicker,
	onSelectPortrait,
	onAddPlayer,
	onStartGame,
}: {
	players: Player[];
	playerCount: number;
	name: string;
	selectedPortrait: number;
	showPortraitPicker: boolean;
	trimmedName: string;
	isDuplicate: boolean;
	canAdd: boolean;
	canStart: boolean;
	onNameChange: (value: string) => void;
	onNameKeyDown: (event: TargetedKeyboardEvent<HTMLInputElement>) => void;
	onTogglePortraitPicker: () => void;
	onSelectPortrait: (index: number) => void;
	onAddPlayer: () => void;
	onStartGame: () => void;
}) {
	const { headingText, messages } = useI18n();

	return (
		<section className="flex min-h-0 flex-col justify-between rounded-[var(--radius-panel)] border border-white/8 bg-black/18 px-5 py-5 md:px-6 md:py-6">
			<div className="space-y-4">
				<p className="section-label text-center">{messages.setup.playerInitialization}</p>

				<div className="mx-auto flex w-full max-w-[560px] items-center justify-center gap-3 px-1 md:px-2">
					<button
						type="button"
						onClick={onTogglePortraitPicker}
						className="border-gold relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border-2 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-[1.03]"
						aria-label={messages.setup.choosePortrait}
					>
						<img
							src={PORTRAITS[selectedPortrait].src}
							alt={messages.setup.choosePortrait}
							className="h-full w-full object-cover"
						/>
						<span className="text-gold absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent py-1 text-[10px] font-medium">
							{messages.setup.pickPortrait}
						</span>
					</button>

					<div className="flex flex-1 items-center gap-2.5">
						<input
							type="text"
							value={name}
							onChange={(event) => onNameChange(event.currentTarget.value)}
							onKeyDown={onNameKeyDown}
							placeholder={messages.setup.playerNamePlaceholder}
							maxLength={20}
							className="border-gold/25 bg-bg-card/80 text-text-primary placeholder:text-text-muted focus:border-gold focus:ring-gold/30 h-12 flex-1 rounded-xl border px-4 text-base focus:ring-2 focus:outline-none"
						/>
						<button
							type="button"
							onClick={onAddPlayer}
							disabled={!canAdd}
							className={[
								"inline-flex h-12 min-w-28 items-center justify-center gap-1.5 rounded-xl px-4 font-semibold text-base transition-all duration-150",
								canAdd
									? "bg-gold text-bg-overlay shadow-[0_4px_0_var(--color-gold-dark)] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-gold-dark)] cursor-pointer"
									: "bg-btn-disabled text-bg-dark/55 cursor-not-allowed",
							].join(" ")}
						>
							<UserPlus className="h-4 w-4" strokeWidth={2.2} />
							{messages.setup.addPlayer}
						</button>
					</div>
				</div>

				{trimmedName.length > 0 && isDuplicate && (
					<p className="text-fascist text-center text-sm">{messages.setup.nameTaken}</p>
				)}

				{showPortraitPicker && (
					<div className="rounded-[var(--radius-card)] border border-white/10 bg-black/20 p-3">
						<p className="label-text mb-2 text-center">{messages.setup.choosePortrait}</p>
						<div className="grid grid-cols-10 gap-1.5">
							{PORTRAITS.map((portrait, index) => {
								const isUsed = players.some((player) => player.portraitIndex === index);
								const isSelected = selectedPortrait === index;
								return (
									<button
										key={portrait.src}
										type="button"
										onClick={() => onSelectPortrait(index)}
										disabled={isUsed}
										className={[
											"aspect-square w-full overflow-hidden rounded-full border-2 transition-all duration-150",
											isSelected && !isUsed ? "border-gold scale-110" : "border-transparent",
											isUsed ? "opacity-30 grayscale cursor-not-allowed" : "hover:scale-105 cursor-pointer",
										].join(" ")}
									>
										<img
											src={portrait.src}
											alt={`${messages.setup.choosePortrait} ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>

			<div className="pt-4">
				<div className="text-text-muted mb-3 text-center text-sm">
					{messages.setup.playerCount(playerCount, MAX_PLAYERS)}
					{!canStart && playerCount > 0 && playerCount < MIN_PLAYERS
						? ` • ${messages.setup.morePlayersNeeded(MIN_PLAYERS - playerCount)}`
						: ""}
				</div>
				<div className="flex flex-col items-center gap-3">
					<button
						type="button"
						onClick={onStartGame}
						disabled={!canStart}
						className={[
							"w-full max-w-sm rounded-[16px] py-3 font-heading text-3xl tracking-[0.04em] transition-all duration-200",
							canStart
								? "bg-fascist text-white shadow-[0_6px_0_var(--color-fascist-dark),0_14px_24px_rgba(0,0,0,0.28)] hover:bg-fascist-hover active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-fascist-dark)] cursor-pointer"
								: "bg-btn-disabled text-bg-dark/55 cursor-not-allowed",
						].join(" ")}
					>
						{headingText(messages.setup.startGame)}
					</button>

					<a
						href="/rules.pdf"
						target="_blank"
						rel="noreferrer"
						className={[
							"w-full max-w-sm rounded-[16px] py-3 font-heading text-3xl tracking-[0.04em] transition-all duration-200",
							"bg-liberal text-white text-center shadow-[0_6px_0_var(--color-liberal-dark),0_14px_24px_rgba(0,0,0,0.28)] hover:bg-liberal-hover active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-liberal-dark)] cursor-pointer",
						].join(" ")}
					>
						{headingText(messages.common.readRules)}
					</a>
				</div>
			</div>
		</section>
	);
});

const SeatingRow = memo(function SeatingRow({
	player,
	index,
	isDragging,
	isDropTarget,
	onBeginDrag,
	onDragMove,
	onDragEnd,
	onRemovePlayer,
}: {
	player: Player;
	index: number;
	isDragging: boolean;
	isDropTarget: boolean;
	onBeginDrag: (playerId: number, event: TargetedPointerEvent<HTMLButtonElement>) => void;
	onDragMove: (event: TargetedPointerEvent<HTMLButtonElement>) => void;
	onDragEnd: (event: TargetedPointerEvent<HTMLButtonElement>) => void;
	onRemovePlayer: (playerId: number) => void;
}) {
	const { messages } = useI18n();

	return (
		<div
			data-player-id={player.id}
			className={[
				"fade-in flex items-center gap-3 rounded-xl border border-white/8 bg-bg-card/70 px-3 py-3 shadow-[0_10px_16px_rgba(0,0,0,0.18)] transition-all",
				PLAYER_COLOR_STYLES[player.color] ?? "border-text-muted",
				isDragging ? "scale-[1.01] ring-2 ring-gold/50 opacity-85" : "",
				isDropTarget ? "ring-2 ring-liberal/50" : "",
			].join(" ")}
		>
			<span className="text-text-muted w-6 text-right text-sm font-semibold">{index + 1}</span>

			<img
				src={PORTRAITS[player.portraitIndex]?.src}
				alt={player.name}
				className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20"
			/>

			<div className="min-w-0 flex-1">
				<p className="text-text-primary truncate text-lg font-semibold">{player.name}</p>
				<p className="label-text">{messages.common.player}</p>
			</div>

			<button
				type="button"
				onPointerDown={(event) => onBeginDrag(player.id, event)}
				onPointerMove={onDragMove}
				onPointerUp={onDragEnd}
				onPointerCancel={onDragEnd}
				className="border-gold/35 text-gold inline-flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-lg border bg-black/25 active:cursor-grabbing"
				aria-label={messages.setup.dragToMove(player.name)}
				title={messages.setup.dragToReorder}
			>
				<GripVertical className="h-5 w-5" strokeWidth={2.2} />
			</button>

			<button
				type="button"
				onClick={() => onRemovePlayer(player.id)}
				className="text-text-muted hover:text-fascist cursor-pointer rounded-md p-2 transition-colors"
				aria-label={messages.setup.removePlayer(player.name)}
			>
				<Trash2 className="h-4 w-4" strokeWidth={2.1} />
			</button>
		</div>
	);
});

const SeatingOrderPanel = memo(function SeatingOrderPanel({
	players,
	draggingPlayerId,
	dropTargetPlayerId,
	onBeginDrag,
	onDragMove,
	onDragEnd,
	onRemovePlayer,
}: {
	players: Player[];
	draggingPlayerId: number | null;
	dropTargetPlayerId: number | null;
	onBeginDrag: (playerId: number, event: TargetedPointerEvent<HTMLButtonElement>) => void;
	onDragMove: (event: TargetedPointerEvent<HTMLButtonElement>) => void;
	onDragEnd: (event: TargetedPointerEvent<HTMLButtonElement>) => void;
	onRemovePlayer: (playerId: number) => void;
}) {
	const { messages } = useI18n();

	return (
		<section className="flex min-h-0 flex-col rounded-[var(--radius-panel)] border border-white/8 bg-black/18 p-4 md:p-5">
			<div className="mb-2 flex items-center justify-between">
				<p className="section-label">{messages.setup.seatingOrder}</p>
				<p className="text-text-muted text-xs">{messages.setup.reorderHint}</p>
			</div>

			{players.length === 0 ? (
				<div className="text-text-muted flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/15">
					{messages.setup.addPlayersToBegin}
				</div>
			) : (
				<div className="min-h-0 flex-1 overflow-y-auto pr-1">
					<div className="space-y-2">
						{players.map((player, index) => {
							return (
								<SeatingRow
									key={player.id}
									player={player}
									index={index}
									isDragging={draggingPlayerId === player.id}
									isDropTarget={dropTargetPlayerId === player.id && draggingPlayerId !== null}
									onBeginDrag={onBeginDrag}
									onDragMove={onDragMove}
									onDragEnd={onDragEnd}
									onRemovePlayer={onRemovePlayer}
								/>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
});

const ProjectFooter = memo(function ProjectFooter() {
	const { messages } = useI18n();

	return (
		<footer className="home-credit-card">
			<p>
				{messages.setup.projectOpenSource.beforeLicense}
				<a
					href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
					target="_blank"
					rel="noreferrer"
					className="home-credit-link"
				>
					CC BY-NC-SA 4.0
				</a>
				{messages.setup.projectOpenSource.afterLicense}
			</p>
			<p>
				{messages.setup.adaptedFromOriginal.beforeTitle}
				<a href="https://secrethitler.com" target="_blank" rel="noreferrer" className="home-credit-link">
					Secret Hitler
				</a>
				{messages.setup.adaptedFromOriginal.afterTitle}
			</p>
		</footer>
	);
});

export function SetupScreen({ state, dispatch }: ScreenProps) {
	const { headingText, messages } = useI18n();
	const [uiState, updateUi] = useReducer(setupUiReducer, INITIAL_UI_STATE);
	const activePointerIdRef = useRef<number | null>(null);

	const playerCount = state.players.length;
	const trimmedName = uiState.name.trim();
	const isDuplicate = state.players.some((player) => player.name.toLowerCase() === trimmedName.toLowerCase());
	const canAdd = trimmedName.length > 0 && !isDuplicate && playerCount < MAX_PLAYERS;
	const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS;

	const handleAddPlayer = useCallback(() => {
		if (!canAdd) return;

		dispatch({
			type: "ADD_PLAYER",
			name: trimmedName,
			portraitIndex: uiState.selectedPortrait,
		});

		updateUi({
			type: "player/added",
			nextPortrait: getNextPortraitIndex(state.players, uiState.selectedPortrait),
		});
	}, [canAdd, dispatch, state.players, trimmedName, uiState.selectedPortrait]);

	const handleNameKeyDown = useCallback(
		(event: TargetedKeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Enter") {
				handleAddPlayer();
			}
		},
		[handleAddPlayer],
	);

	const beginDrag = useCallback(
		(playerId: number, event: TargetedPointerEvent<HTMLButtonElement>) => {
			if (playerCount < 2) return;

			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			activePointerIdRef.current = event.pointerId;
			updateUi({ type: "drag/start", playerId });
		},
		[playerCount],
	);

	const handleDragMove = useCallback(
		(event: TargetedPointerEvent<HTMLButtonElement>) => {
			if (activePointerIdRef.current !== event.pointerId || uiState.draggingPlayerId === null) {
				return;
			}

			const element = document.elementFromPoint(event.clientX, event.clientY);
			const row = element?.closest("[data-player-id]") as HTMLElement | null;
			if (!row?.dataset.playerId) return;

			const targetId = Number(row.dataset.playerId);
			if (Number.isNaN(targetId) || targetId === uiState.dropTargetPlayerId) return;

			updateUi({ type: "drag/hover", playerId: targetId });
		},
		[uiState.draggingPlayerId, uiState.dropTargetPlayerId],
	);

	const handleDragEnd = useCallback(
		(event: TargetedPointerEvent<HTMLButtonElement>) => {
			if (activePointerIdRef.current !== event.pointerId) {
				return;
			}

			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}

			if (
				uiState.draggingPlayerId !== null &&
				uiState.dropTargetPlayerId !== null &&
				uiState.draggingPlayerId !== uiState.dropTargetPlayerId
			) {
				dispatch({
					type: "REORDER_PLAYER_TO",
					fromPlayerId: uiState.draggingPlayerId,
					toPlayerId: uiState.dropTargetPlayerId,
				});
			}

			activePointerIdRef.current = null;
			updateUi({ type: "drag/end" });
		},
		[dispatch, uiState.draggingPlayerId, uiState.dropTargetPlayerId],
	);

	const handleNameChange = useCallback((value: string) => {
		updateUi({ type: "name/set", value });
	}, []);

	const handleTogglePortraitPicker = useCallback(() => {
		updateUi({ type: "portrait/toggle" });
	}, []);

	const handleSelectPortrait = useCallback((index: number) => {
		updateUi({ type: "portrait/select", index });
	}, []);

	const handleStartGame = useCallback(() => {
		dispatch({ type: "START_GAME" });
	}, [dispatch]);

	const handleRemovePlayer = useCallback(
		(playerId: number) => {
			dispatch({ type: "REMOVE_PLAYER", playerId });
		},
		[dispatch],
	);

	return (
		<div className="bg-bg-darker h-dvh w-full overflow-hidden">
			<div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 pt-3 pb-4 md:px-6 md:pb-6">
				<div className="flex-shrink-0 text-center">
					<h1 className="font-heading text-fascist text-4xl leading-none tracking-wide md:text-5xl">
						{headingText(messages.brand.title)}
					</h1>
					<p className="font-flavor text-text-muted mt-1 text-xs">{messages.brand.subtitle}</p>
				</div>

				<div className="border-gold/15 mt-3 min-h-0 flex-1 overflow-hidden rounded-[var(--radius-panel)] border bg-[linear-gradient(180deg,rgba(43,31,22,0.88),rgba(25,17,12,0.9))] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.34)] md:p-6">
					<div className="flex h-full min-h-0 flex-col gap-4">
						<LanguageSelector />
						<div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(380px,520px)_minmax(260px,1fr)]">
							<PlayerSetupPanel
								players={state.players}
								playerCount={playerCount}
								name={uiState.name}
								selectedPortrait={uiState.selectedPortrait}
								showPortraitPicker={uiState.showPortraitPicker}
								trimmedName={trimmedName}
								isDuplicate={isDuplicate}
								canAdd={canAdd}
								canStart={canStart}
								onNameChange={handleNameChange}
								onNameKeyDown={handleNameKeyDown}
								onTogglePortraitPicker={handleTogglePortraitPicker}
								onSelectPortrait={handleSelectPortrait}
								onAddPlayer={handleAddPlayer}
								onStartGame={handleStartGame}
							/>

							<SeatingOrderPanel
								players={state.players}
								draggingPlayerId={uiState.draggingPlayerId}
								dropTargetPlayerId={uiState.dropTargetPlayerId}
								onBeginDrag={beginDrag}
								onDragMove={handleDragMove}
								onDragEnd={handleDragEnd}
								onRemovePlayer={handleRemovePlayer}
							/>
						</div>
					</div>
				</div>

				<ProjectFooter />
			</div>
		</div>
	);
}
