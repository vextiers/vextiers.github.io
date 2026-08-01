// Convert tier label → number (BOTTOM → TOP: LT5, HT5, LT4, HT4, LT3, HT3, LT2, HT2, LT1, HT1)
function tierToNumber(tier) {
    const map = {
        "LT5": 1,
        "HT5": 2,
        "LT4": 3,
        "HT4": 4,
        "LT3": 5,
        "HT3": 6,
        "LT2": 7,
        "HT2": 8,
        "LT1": 9,
        "HT1": 10
    };
    return map[tier] || null;
}

// Convert number → tier label
function numberToTier(num) {
    const map = {
        1: "LT5",
        2: "HT5",
        3: "LT4",
        4: "HT4",
        5: "LT3",
        6: "HT3",
        7: "LT2",
        8: "HT2",
        9: "LT1",
        10: "HT1"
    };
    return map[num] || "Unknown";
}

// Calculate average tier score
function calculateAverageTier(modes) {
    let total = 0;
    let count = 0;

    for (const mode in modes) {
        if (modes[mode] !== null) {
            const num = tierToNumber(modes[mode]);
            if (num !== null) {
                total += num;
                count++;
            }
        }
    }

    return { total, count };
}

// Load rankings (used by index.html)
function loadRankings() {
    const selectedMode = document.getElementById("modeSelector").value;

    fetch("players.json")
        .then(res => res.json())
        .then(players => {

            // Calculate stats for each player
            players.forEach(p => {
                const { total, count } = calculateAverageTier(p.modes);
                p.testedModes = count;
                p.averageTierScore = count > 0 ? total / count : 0;
                p.overallTier = numberToTier(Math.round(p.averageTierScore));
            });

            let filtered = players;

            // Mode-specific ranking
            if (selectedMode !== "overall") {
                filtered = players.filter(p => p.modes[selectedMode] !== null);

                filtered.sort((a, b) => {
                    return tierToNumber(b.modes[selectedMode]) - tierToNumber(a.modes[selectedMode]);
                });
            }

            // Overall ranking
            else {
                filtered.sort((a, b) => {
                    if (b.testedModes !== a.testedModes) {
                        return b.testedModes - a.testedModes;
                    }
                    return b.averageTierScore - a.averageTierScore;
                });
            }

            const board = document.getElementById("leaderboard");
            board.innerHTML = "";

            // Build rows
            filtered.forEach((p, index) => {
                const row = document.createElement("div");
                row.className = "playerRow";

                let modeDisplay = "";

                // Overall: show ONLY tested modes
                if (selectedMode === "overall") {
                    modeDisplay = Object.entries(p.modes)
                        .filter(([mode, tier]) => tier !== null)
                        .map(([mode, tier]) => `
                            <div class="modeTag">${mode}: ${tier}</div>
                        `)
                        .join("");
                }

                // Mode-specific: show ONLY that mode
                else {
                    modeDisplay = `
                        <div class="modeTag">${selectedMode}: ${p.modes[selectedMode]}</div>
                    `;
                }

                row.innerHTML = `
                    <div class="rank">#${index + 1}</div>

                    <div class="nameBlock">
                        <div class="playerName">${p.name}</div>
                    </div>

                    <div class="modeBlock">
                        ${modeDisplay}
                    </div>
                `;

                board.appendChild(row);
            });
        });
}
