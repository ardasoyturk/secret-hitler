import type {
	ExecutivePower,
	GamePhase,
	PartyMembership,
	PolicyType,
	Role,
	Team,
	VictoryReason,
	Vote,
} from "@engine/types";

import type { AppLanguage } from "./shared";

export interface MessageCatalog {
	document: {
		title: string;
		description: string;
	};
	brand: {
		title: string;
		subtitle: string;
	};
	language: {
		label: string;
		options: Record<AppLanguage, string>;
		buttonLabel: (languageLabel: string) => string;
	};
	enums: {
		phases: Record<GamePhase, string>;
		roles: Record<Role, string>;
		teams: Record<Team, string>;
		partyMemberships: Record<PartyMembership, string>;
		policyTypes: Record<PolicyType, string>;
		votes: Record<Vote, string>;
		executivePowers: Record<ExecutivePower, string>;
		executivePowerBadges: Record<ExecutivePower, string>;
		victoryReasons: Record<VictoryReason, string>;
	};
	common: {
		round: (round: number) => string;
		president: string;
		chancellor: string;
		player: string;
		passDevice: string;
		handDeviceTo: string;
		ready: string;
		continue: string;
		understood: string;
		gotIt: string;
		selectPlayer: string;
		newGame: string;
		resumeGame: string;
		readRules: string;
		unknownPhase: (phase: string) => string;
	};
	resumePrompt: {
		title: string;
		savedGameFound: string;
		summary: (playerCount: number, round: number) => string;
	};
	setup: {
		playerInitialization: string;
		choosePortrait: string;
		pickPortrait: string;
		playerNamePlaceholder: string;
		addPlayer: string;
		nameTaken: string;
		playerCount: (playerCount: number, maxPlayers: number) => string;
		morePlayersNeeded: (remainingPlayers: number) => string;
		startGame: string;
		seatingOrder: string;
		reorderHint: string;
		addPlayersToBegin: string;
		dragToMove: (playerName: string) => string;
		dragToReorder: string;
		removePlayer: (playerName: string) => string;
		projectOpenSource: {
			beforeLicense: string;
			afterLicense: string;
		};
		adaptedFromOriginal: {
			beforeTitle: string;
			afterTitle: string;
		};
	};
	header: {
		president: string;
		chancellor: string;
	};
	board: {
		liberalBoard: string;
		fascistBoard: string;
		liberalBoardAlt: string;
		fascistBoardAlt: string;
		liberalPolicyAlt: (position: number) => string;
		fascistPolicyAlt: (position: number) => string;
		electionTrackerPosition: (position: number) => string;
		veto: string;
	};
	nomination: {
		governmentFormation: string;
		title: string;
		instructions: (presidentName: string) => string;
		eligible: string;
		unavailable: string;
		ineligibleReasons: {
			dead: string;
			president: string;
			termLimit: string;
		};
		confirm: string;
	};
	voting: {
		electionResult: string;
		electionPasses: string;
		electionFails: string;
		voteCount: (jaCount: number, neinCount: number) => string;
		voterTitle: (playerName: string) => string;
		voteOnGovernment: string;
		governmentSummary: (
			presidentName: string,
			chancellorName: string,
		) => string;
		tableShortcut: string;
		tableShortcutDescription: string;
		passElectionAsAllJa: string;
	};
	night: {
		playerProgress: (playerNumber: number, totalPlayers: number) => string;
		roleCardAlt: (roleLabel: string) => string;
		youAreA: string;
		liberalDescription: string;
		fascistDescription: string;
		hitlerDescription: string;
		yourTeammates: string;
		yourFascistAlly: string;
		unknownFascists: string;
	};
	legislative: {
		session: string;
		presidentTitle: (presidentName: string) => string;
		presidentInstructions: string;
		chancellorTitle: (chancellorName: string) => string;
		chancellorInstructions: string;
		discard: string;
		enact: string;
		discardSelectedPolicy: string;
		tapPolicyToDiscard: string;
		enactSelectedPolicy: string;
		tapPolicyToEnact: string;
		requestVeto: string;
	};
	executive: {
		executivePower: string;
		investigateTitle: string;
		investigateInstructions: (presidentName: string) => string;
		investigateConfirm: (playerName: string) => string;
		investigationResult: string;
		isPartyMember: string;
		partyLabel: (partyName: string) => string;
		investigationNote: string;
		peekTitle: string;
		peekInstructions: (presidentName: string) => string;
		peekNote: string;
		peekPositions: [string, string, string];
		specialElectionTitle: string;
		specialElectionInstructions: (presidentName: string) => string;
		specialElectionConfirm: (playerName: string) => string;
		executionTitle: string;
		executionInstructions: (presidentName: string) => string;
		executionWarning: string;
		executionConfirm: (playerName: string) => string;
	};
	veto: {
		title: string;
		vetoCallout: string;
		requestDescription: (chancellorName: string) => string;
		consentPrompt: (presidentName: string) => string;
		explanation: string;
		approve: string;
		reject: string;
	};
	policyEnacted: {
		chaosTitle: string;
		chaosDescription: string;
		chaosPolicy: string;
		policyEnacted: string;
		policyTitle: (policyName: string) => string;
		hasBeenEnacted: string;
		vetoUnlocked: string;
		vetoUnlockedDescription: string;
	};
	gameOver: {
		liberalsWin: string;
		fascistsWin: string;
		allRolesRevealed: string;
		dead: string;
		victoryBannerAlt: (teamName: string) => string;
	};
	cards: {
		partyMembership: (partyName: string) => string;
		policy: (policyName: string) => string;
		faceDownPolicy: string;
		voteJa: string;
		voteNein: string;
	};
}

export const MESSAGE_CATALOGS: Record<AppLanguage, MessageCatalog> = {
	en: {
		document: {
			title: "Secret Hitler — Pass & Play",
			description:
				"Secret Hitler — Pass & Play Edition. A single-device board game for 5-10 players.",
		},
		brand: {
			title: "SECRET HITLER",
			subtitle: "Pass & Play Edition",
		},
		language: {
			label: "Language",
			options: {
				en: "English",
				tr: "Türkçe",
			},
			buttonLabel: (languageLabel) =>
				`Switch language to ${languageLabel}`,
		},
		enums: {
			phases: {
				setup: "Setting Up",
				night_round: "Night Round",
				night_reveal: "Viewing Role",
				chancellor_nomination: "Nominate Chancellor",
				election: "Election",
				vote_cast: "Cast Your Vote",
				vote_result: "Vote Results",
				president_legislation: "President Legislates",
				chancellor_legislation: "Chancellor Legislates",
				veto_requested: "Veto Requested",
				policy_enacted: "Policy Enacted",
				executive_investigate: "Investigation",
				investigation_result: "Investigation Result",
				executive_peek: "Policy Peek",
				executive_special_election: "Special Election",
				executive_execution: "Execution",
				chaos_policy: "Chaos!",
				game_over: "Game Over",
			},
			roles: {
				liberal: "Liberal",
				fascist: "Fascist",
				hitler: "Hitler",
			},
			teams: {
				liberal: "Liberal",
				fascist: "Fascist",
			},
			partyMemberships: {
				liberal: "Liberal",
				fascist: "Fascist",
			},
			policyTypes: {
				liberal: "Liberal",
				fascist: "Fascist",
			},
			votes: {
				ja: "Ja",
				nein: "Nein",
			},
			executivePowers: {
				none: "",
				investigate_loyalty: "Investigation",
				policy_peek: "Policy Peek",
				special_election: "Special Election",
				execution: "Execution",
			},
			executivePowerBadges: {
				none: "",
				investigate_loyalty: "Investigate",
				policy_peek: "Peek",
				special_election: "Election",
				execution: "Execution",
			},
			victoryReasons: {
				liberal_policies:
					"5 Liberal policies have been enacted. Democracy prevails!",
				fascist_policies:
					"6 Fascist policies have been enacted. The government has fallen.",
				hitler_executed:
					"Hitler has been found and executed. Freedom is restored!",
				hitler_elected_chancellor:
					"Hitler was elected Chancellor with 3+ Fascist policies in play. The conspiracy succeeds.",
			},
		},
		common: {
			round: (round) => `Round ${round}`,
			president: "President",
			chancellor: "Chancellor",
			player: "Player",
			passDevice: "Pass the Device",
			handDeviceTo: "Hand the device to",
			ready: "I'm Ready",
			continue: "Continue",
			understood: "Understood",
			gotIt: "Got It",
			selectPlayer: "Select a Player",
			newGame: "New Game",
			resumeGame: "Resume Game",
			readRules: "Read Rules",
			unknownPhase: (phase) => `Unknown phase: ${phase}`,
		},
		resumePrompt: {
			title: "Game in Progress",
			savedGameFound: "A saved game was found:",
			summary: (playerCount, round) =>
				`${playerCount} players · Round ${round}`,
		},
		setup: {
			playerInitialization: "Player Initialization",
			choosePortrait: "Choose portrait",
			pickPortrait: "Pick",
			playerNamePlaceholder: "Player name",
			addPlayer: "Add",
			nameTaken: "Name already taken.",
			playerCount: (playerCount, maxPlayers) =>
				`${playerCount} / ${maxPlayers} players`,
			morePlayersNeeded: (remainingPlayers) =>
				`Need ${remainingPlayers} more`,
			startGame: "Start Game",
			seatingOrder: "Seating Order",
			reorderHint: "Drag handle to reorder",
			addPlayersToBegin: "Add players to begin",
			dragToMove: (playerName) => `Drag to move ${playerName}`,
			dragToReorder: "Drag to reorder",
			removePlayer: (playerName) => `Remove ${playerName}`,
			projectOpenSource: {
				beforeLicense:
					"The project is open-source, and is licensed under ",
				afterLicense:
					". You can read more about the project on GitHub.",
			},
			adaptedFromOriginal: {
				beforeTitle: "Adapted from the original ",
				afterTitle:
					" board game by Goat, Wolf, & Cabbage (c) 2016-2020.",
			},
		},
		header: {
			president: "President",
			chancellor: "Chancellor",
		},
		board: {
			liberalBoard: "Liberal Board",
			fascistBoard: "Fascist Board",
			liberalBoardAlt: "Liberal policy board",
			fascistBoardAlt: "Fascist policy board",
			liberalPolicyAlt: (position) => `Liberal policy ${position}`,
			fascistPolicyAlt: (position) => `Fascist policy ${position}`,
			electionTrackerPosition: (position) =>
				`Election tracker position ${position}`,
			veto: "Veto",
		},
		nomination: {
			governmentFormation: "Government Formation",
			title: "Chancellor Nomination",
			instructions: (presidentName) =>
				`President ${presidentName}, nominate a Chancellor`,
			eligible: "Eligible",
			unavailable: "Unavailable",
			ineligibleReasons: {
				dead: "Dead",
				president: "President",
				termLimit: "Term limit",
			},
			confirm: "Confirm Nomination",
		},
		voting: {
			electionResult: "Election Result",
			electionPasses: "JA! Election Passes",
			electionFails: "NEIN! Election Fails",
			voteCount: (jaCount, neinCount) =>
				`${jaCount} Ja — ${neinCount} Nein`,
			voterTitle: (playerName) => `${playerName}'s Vote`,
			voteOnGovernment: "Vote on the Government",
			governmentSummary: (presidentName, chancellorName) =>
				`President ${presidentName} · Chancellor ${chancellorName}`,
			tableShortcut: "Table Shortcut",
			tableShortcutDescription:
				"If everyone agrees on Ja, pass this election in one tap and reveal the normal result.",
			passElectionAsAllJa: "Pass Election as All Ja",
		},
		night: {
			playerProgress: (playerNumber, totalPlayers) =>
				`Player ${playerNumber} of ${totalPlayers}`,
			roleCardAlt: (roleLabel) => `${roleLabel} role card`,
			youAreA: "You are a",
			liberalDescription:
				"You must work to enact 5 Liberal policies or find and execute Hitler. Trust no one.",
			fascistDescription:
				"You must sabotage the government and help enact 6 Fascist policies — or get Hitler elected Chancellor after 3 Fascist policies.",
			hitlerDescription:
				"You are on the Fascist team, but you must stay hidden. If you are executed, the Liberals win.",
			yourTeammates: "Your Teammates",
			yourFascistAlly: "Your Fascist Ally",
			unknownFascists: "You do not know who the other Fascists are.",
		},
		legislative: {
			session: "Legislative Session",
			presidentTitle: (presidentName) => `President ${presidentName}`,
			presidentInstructions:
				"Examine these 3 policies. Discard one and pass the remaining two to the Chancellor.",
			chancellorTitle: (chancellorName) => `Chancellor ${chancellorName}`,
			chancellorInstructions:
				"The President has passed you 2 policies. Enact one into law.",
			discard: "Discard",
			enact: "Enact",
			discardSelectedPolicy: "Discard Selected Policy",
			tapPolicyToDiscard: "Tap a Policy to Discard",
			enactSelectedPolicy: "Enact Selected Policy",
			tapPolicyToEnact: "Tap a Policy to Enact",
			requestVeto: "Request Veto",
		},
		executive: {
			executivePower: "Executive Power",
			investigateTitle: "Investigate Loyalty",
			investigateInstructions: (presidentName) =>
				`President ${presidentName}, choose a player to investigate their party membership.`,
			investigateConfirm: (playerName) => `Investigate ${playerName}`,
			investigationResult: "Investigation Result",
			isPartyMember: "is a member of the...",
			partyLabel: (partyName) => `${partyName} Party`,
			investigationNote:
				"Only the President knows this information. Use it wisely — or lie about it.",
			peekTitle: "Policy Peek",
			peekInstructions: (presidentName) =>
				`President ${presidentName}, here are the top 3 policies in the deck.`,
			peekNote:
				"Only the President knows this. You may share this information — or deceive.",
			peekPositions: ["Next", "2nd", "3rd"],
			specialElectionTitle: "Special Election",
			specialElectionInstructions: (presidentName) =>
				`President ${presidentName}, choose the next Presidential Candidate.`,
			specialElectionConfirm: (playerName) => `Appoint ${playerName}`,
			executionTitle: "Execution",
			executionInstructions: (presidentName) =>
				`President ${presidentName}, choose a player to execute.`,
			executionWarning: "This action is irreversible.",
			executionConfirm: (playerName) => `Execute ${playerName}`,
		},
		veto: {
			title: "Veto Requested",
			vetoCallout: "Veto!",
			requestDescription: (chancellorName) =>
				`Chancellor ${chancellorName} has requested to veto the entire agenda.`,
			consentPrompt: (presidentName) =>
				`President ${presidentName}, do you consent?`,
			explanation:
				"If approved, both policies are discarded and the election tracker advances. If rejected, the Chancellor must enact a policy.",
			approve: "Approve Veto",
			reject: "Reject Veto",
		},
		policyEnacted: {
			chaosTitle: "The Country Is in Chaos!",
			chaosDescription:
				"3 elections failed in a row. A policy was enacted automatically from the top of the deck.",
			chaosPolicy: "Chaos Policy",
			policyEnacted: "Policy Enacted",
			policyTitle: (policyName) => `A ${policyName} Policy`,
			hasBeenEnacted: "has been enacted!",
			vetoUnlocked: "Veto Power Unlocked!",
			vetoUnlockedDescription:
				"The Chancellor may now propose to veto the agenda.",
		},
		gameOver: {
			liberalsWin: "Liberals Win!",
			fascistsWin: "Fascists Win!",
			allRolesRevealed: "All Roles Revealed",
			dead: "(dead)",
			victoryBannerAlt: (teamName) => `${teamName} victory`,
		},
		cards: {
			partyMembership: (partyName) => `Party Membership: ${partyName}`,
			policy: (policyName) => `${policyName} policy`,
			faceDownPolicy: "Policy card (face down)",
			voteJa: "Ja! (Yes)",
			voteNein: "Nein! (No)",
		},
	},
	tr: {
		document: {
			title: "Secret Hitler — Sırayla Oyna",
			description:
				"Secret Hitler için 5-10 oyunculu, tek cihazda sırayla oynanan bir masa oyunu.",
		},
		brand: {
			title: "SECRET HITLER",
			subtitle: "Sırayla Oyna",
		},
		language: {
			label: "Dil",
			options: {
				en: "English",
				tr: "Türkçe",
			},
			buttonLabel: (languageLabel) =>
				`Dili ${languageLabel} olarak değiştir`,
		},
		enums: {
			phases: {
				setup: "Kurulum",
				night_round: "Gece Turu",
				night_reveal: "Rolünü Gör",
				chancellor_nomination: "Şansölye Adayı",
				election: "Seçim",
				vote_cast: "Oy Ver",
				vote_result: "Oy Sonuçları",
				president_legislation: "Başkanın Yasa Turu",
				chancellor_legislation: "Şansölyenin Yasa Turu",
				veto_requested: "Veto İstendi",
				policy_enacted: "Yasa Çıkarıldı",
				executive_investigate: "Soruşturma",
				investigation_result: "Soruşturma Sonucu",
				executive_peek: "Politika İncelemesi",
				executive_special_election: "Özel Seçim",
				executive_execution: "İnfaz",
				chaos_policy: "Kaos!",
				game_over: "Oyun Bitti",
			},
			roles: {
				liberal: "Liberal",
				fascist: "Fasist",
				hitler: "Hitler",
			},
			teams: {
				liberal: "Liberal",
				fascist: "Fasist",
			},
			partyMemberships: {
				liberal: "Liberal",
				fascist: "Fasist",
			},
			policyTypes: {
				liberal: "Liberal",
				fascist: "Fasist",
			},
			votes: {
				ja: "Ja",
				nein: "Nein",
			},
			executivePowers: {
				none: "",
				investigate_loyalty: "Soruşturma",
				policy_peek: "Politika İncelemesi",
				special_election: "Özel Seçim",
				execution: "İnfaz",
			},
			executivePowerBadges: {
				none: "",
				investigate_loyalty: "Soruşturma",
				policy_peek: "İnceleme",
				special_election: "Seçim",
				execution: "İnfaz",
			},
			victoryReasons: {
				liberal_policies:
					"5 Liberal yasa yürürlüğe girdi. Demokrasi kazandı!",
				fascist_policies:
					"6 Faşist yasa yürürlüğe girdi. Hükümet düştü.",
				hitler_executed:
					"Hitler bulundu ve infaz edildi. Özgürlük geri geldi!",
				hitler_elected_chancellor:
					"Masada 3+ Faşist yasa varken Hitler Şansölye seçildi. Komplo başarıya ulaştı.",
			},
		},
		common: {
			round: (round) => `Tur ${round}`,
			president: "Başkan",
			chancellor: "Şansölye",
			player: "Oyuncu",
			passDevice: "Cihazı Devret",
			handDeviceTo: "Cihazı şuna ver",
			ready: "Hazırım",
			continue: "Devam Et",
			understood: "Anlaşıldı",
			gotIt: "Anladım",
			selectPlayer: "Bir Oyuncu Seç",
			newGame: "Yeni Oyun",
			resumeGame: "Oyuna Devam Et",
			readRules: "Kuralları Oku",
			unknownPhase: (phase) => `Bilinmeyen aşama: ${phase}`,
		},
		resumePrompt: {
			title: "Oyun Devam Ediyor",
			savedGameFound: "Kaydedilmiş bir oyun bulundu:",
			summary: (playerCount, round) =>
				`${playerCount} oyuncu · Tur ${round}`,
		},
		setup: {
			playerInitialization: "Oyuncu Kurulumu",
			choosePortrait: "Portre Seç",
			pickPortrait: "Seç",
			playerNamePlaceholder: "Oyuncu adı",
			addPlayer: "Ekle",
			nameTaken: "Bu ad zaten kullanılıyor.",
			playerCount: (playerCount, maxPlayers) =>
				`${playerCount} / ${maxPlayers} oyuncu`,
			morePlayersNeeded: (remainingPlayers) =>
				`${remainingPlayers} oyuncu daha gerekli`,
			startGame: "Oyunu Baslat",
			seatingOrder: "Oturma Sırası",
			reorderHint: "Yeniden sıralamak için tutamacı sürükle",
			addPlayersToBegin: "Başlamak için oyuncu ekle",
			dragToMove: (playerName) =>
				`${playerName} oyuncusunu taşımak için sürükle`,
			dragToReorder: "Yeniden sıralamak için sürükle",
			removePlayer: (playerName) => `${playerName} oyuncusunu çıkar`,
			projectOpenSource: {
				beforeLicense: "Bu proje açık kaynaklıdır ve ",
				afterLicense:
					" lisansı ile yayımlanmıştır. Proje hakkında GitHub'da daha fazla bilgi bulabilirsin.",
			},
			adaptedFromOriginal: {
				beforeTitle:
					"Goat, Wolf, & Cabbage'ın (c) 2016-2020 tarihli özgün ",
				afterTitle: " kutu oyunundan uyarlanmıştır.",
			},
		},
		header: {
			president: "Başkan",
			chancellor: "Şansölye",
		},
		board: {
			liberalBoard: "Liberal Tahtası",
			fascistBoard: "Faşist Tahtası",
			liberalBoardAlt: "Liberal yasa tahtası",
			fascistBoardAlt: "Faşist yasa tahtası",
			liberalPolicyAlt: (position) => `Liberal yasa ${position}`,
			fascistPolicyAlt: (position) => `Faşist yasa ${position}`,
			electionTrackerPosition: (position) =>
				`Seçim göstergesi konumu ${position}`,
			veto: "Veto",
		},
		nomination: {
			governmentFormation: "Hükümet Kurulumu",
			title: "Şansölye Adayını Seç",
			instructions: (presidentName) =>
				`Başkan ${presidentName}, bir Şansölye adayı seç`,
			eligible: "Uygun",
			unavailable: "Uygun değil",
			ineligibleReasons: {
				dead: "Ölü",
				president: "Başkan",
				termLimit: "Dönem sınırı",
			},
			confirm: "Adaylığı Onayla",
		},
		voting: {
			electionResult: "Seçim Sonucu",
			electionPasses: "JA! Hükümet Kuruldu",
			electionFails: "NEIN! Hükümet Kurulamadı",
			voteCount: (jaCount, neinCount) =>
				`${jaCount} Ja — ${neinCount} Nein`,
			voterTitle: (playerName) => `${playerName} oy veriyor`,
			voteOnGovernment: "Hükümet İçin Oy Ver",
			governmentSummary: (presidentName, chancellorName) =>
				`Başkan ${presidentName} · Şansölye ${chancellorName}`,
			tableShortcut: "Masa Kısayolu",
			tableShortcutDescription:
				"Masadaki herkes Ja diyorsa, bu seçimi tek dokunuşla geçirip normal sonucu hemen açabilirsin.",
			passElectionAsAllJa: "Seçimi Herkes Ja Oylamıs Gibi Geçir",
		},
		night: {
			playerProgress: (playerNumber, totalPlayers) =>
				`Oyuncu ${playerNumber} / ${totalPlayers}`,
			roleCardAlt: (roleLabel) => `${roleLabel} rol kartı`,
			youAreA: "Sen bir...",
			liberalDescription:
				"5 Liberal yasa çıkarmak ya da Hitler'i bulup infaz etmek zorundasın. Kimseye tamamen güvenme.",
			fascistDescription:
				"Hükümeti sabote edip 6 Faşist yasanın çıkmasına yardım et ya da masada 3 Faşist yasa varken Hitler'i Şansölye seçtir.",
			hitlerDescription:
				"Faşist ekiptesin, ama kimliğini gizli tutmalısın. İnfaz edilirsen Liberaller kazanır.",
			yourTeammates: "Takım Arkadaşların",
			yourFascistAlly: "Faşist Müttefikin",
			unknownFascists: "Diğer Faşistlerin kim olduğunu bilmiyorsun.",
		},
		legislative: {
			session: "Yasa Oturumu",
			presidentTitle: (presidentName) => `Başkan ${presidentName}`,
			presidentInstructions:
				"Bu 3 yasayı incele. Birini elden çıkar ve kalan ikisini Şansölyeye ver.",
			chancellorTitle: (chancellorName) => `Şansölye ${chancellorName}`,
			chancellorInstructions:
				"Başkan sana 2 yasa verdi. Birini yürürlüğe sok.",
			discard: "Elden Çıkar",
			enact: "Yürürlüğe Sok",
			discardSelectedPolicy: "Seçili Yasayı Elden Çıkar",
			tapPolicyToDiscard: "Elden Çıkarmak İçin Bir Yasaya Dokun",
			enactSelectedPolicy: "Seçili Yasayı Yürürlüğe Sok",
			tapPolicyToEnact: "Yürürlüğe Sokmak İçin Bir Yasaya Dokun",
			requestVeto: "Veto İste",
		},
		executive: {
			executivePower: "Yürütme Yetkisi",
			investigateTitle: "Soruşturma",
			investigateInstructions: (presidentName) =>
				`Başkan ${presidentName}, parti üyeliğini soruşturmak için bir oyuncu seç.`,
			investigateConfirm: (playerName) =>
				`${playerName} oyuncusunu soruştur`,
			investigationResult: "Soruşturma Sonucu",
			isPartyMember: "şu partinin üyesi...",
			partyLabel: (partyName) => `${partyName} Partisi`,
			investigationNote:
				"Bu bilgiyi yalnızca Başkan biliyor. İstersen paylaş, istersen blöf yap.",
			peekTitle: "Politika İncelemesi",
			peekInstructions: (presidentName) =>
				`Başkan ${presidentName}, destenin üstündeki 3 yasa burada.`,
			peekNote:
				"Bunu yalnızca Başkan bilir. Bu bilgiyi paylaşabilir ya da yanıltabilirsin.",
			peekPositions: ["Sıradaki", "2.", "3."],
			specialElectionTitle: "Özel Seçim",
			specialElectionInstructions: (presidentName) =>
				`Başkan ${presidentName}, sıradaki Başkan adayını seç.`,
			specialElectionConfirm: (playerName) =>
				`${playerName} oyuncusunu ata`,
			executionTitle: "İnfaz",
			executionInstructions: (presidentName) =>
				`Başkan ${presidentName}, infaz edilecek oyuncuyu seç.`,
			executionWarning: "Bu hamle geri alınamaz.",
			executionConfirm: (playerName) =>
				`${playerName} oyuncusunu infaz et`,
		},
		veto: {
			title: "Veto İstendi",
			vetoCallout: "Veto!",
			requestDescription: (chancellorName) =>
				`Şansölye ${chancellorName}, tüm gündemi veto etmeyi istedi.`,
			consentPrompt: (presidentName) =>
				`Başkan ${presidentName}, bunu kabul ediyor musun?`,
			explanation:
				"Onaylanırsa iki yasa da elden çıkarılır ve seçim göstergesi ilerler. Reddedilirse Şansölye bir yasa yürürlüğe sokmak zorundadır.",
			approve: "Vetoyu Onayla",
			reject: "Vetoyu Reddet",
		},
		policyEnacted: {
			chaosTitle: "Ülke Kaos İçinde!",
			chaosDescription:
				"Üst üste 3 seçim başarısız oldu. Destenin en üstündeki yasa otomatik olarak çıkarıldı.",
			chaosPolicy: "Kaos Yasası",
			policyEnacted: "Yasa Çıkarıldı",
			policyTitle: (policyName) => `Bir ${policyName} Yasa`,
			hasBeenEnacted: "yürürlüğe girdi!",
			vetoUnlocked: "Veto Yetkisi Açıldı!",
			vetoUnlockedDescription:
				"Şansölye artık gündemi veto etmeyi önerebilir.",
		},
		gameOver: {
			liberalsWin: "Liberaller Kazandı!",
			fascistsWin: "Faşistler Kazandı!",
			allRolesRevealed: "Tüm Roller Açıldı",
			dead: "(ölü)",
			victoryBannerAlt: (teamName) => `${teamName} zaferi`,
		},
		cards: {
			partyMembership: (partyName) => `Parti üyeliği: ${partyName}`,
			policy: (policyName) => `${policyName} yasa`,
			faceDownPolicy: "Kapalı yasa kartı",
			voteJa: "Ja! (Evet)",
			voteNein: "Nein! (Hayır)",
		},
	},
};
