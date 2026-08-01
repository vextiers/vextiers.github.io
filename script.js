// Convert tier label → number
function tierToNumber(tier) {
    const map = {
        "HT1": 10,
        "HT2": 9,
        "HT3": 8,
        "LT1": 7,
        "LT2": 6,
        "LT3": 5,
        "LT4": 4,
        "LT5": 3
    };
    return map[tier] || null;
}

// Convert number → tier label
function numberToTier(num) {
    const map = {
        10: "HT1",
        9: "HT2",
        8: "HT3",
        7: "LT1",
        6: "LT2",
        5: "LT3",
        4: "LT4",
        3: "LT5"
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

fetch("players.json")
    .then(res => res.json())
    .then(players => {

        players.forEach(p => {
            const { total, count } = calculateAverageTier(p.modes);

            p.testedModes = count;
            p.averageTierScore = count > 0 ? total / count : 0;
            p.overallTier = numberToTier(Math.round(p.averageTierScore));
        });

        // GLOBAL RANKING SYSTEM:
        // 1. More tested modes = higher rank
        // 2. Higher average tier score = higher rank
        players.sort((a, b) => {
            if (b.testedModes !== a.testedModes) {
                return b.testedModes - a.testedModes;
            }
            return b.averageTierScore - a.averageTierScore;
        });

        const list = document.getElementById("overallList");

        players.forEach((p, index) => {
            const div = document.createElement("div");
            div.className = "player";
            div.innerHTML = `
                #${index + 1} — <strong>${p.name}</strong><br>
                Overall Tier: ${p.overallTier}<br>
                Tested Modes: ${p.testedModes}<br>
                Modes: ${Object.entries(p.modes)
                    .map(([mode, tier]) => `${mode}: ${tier ?? "N/A"}`)
                    .join(" • ")}
            `;
            list.appendChild(div);
        });
    });
