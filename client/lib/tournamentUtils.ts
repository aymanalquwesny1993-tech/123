const POINTS = {
  1: 7,
  2: 4,
  3: 3,
  4: 1,
  5: 0,
};

const ROUND_NAMES = {
  1: "Round 1",
  2: "Round 2",
  3: "Round 3",
  4: "Finals",
};

export { POINTS, ROUND_NAMES };

export const generateId = () => Math.random().toString(36).substr(2, 9);

export interface Player {
  id: string;
  name: string;
  baseScore: number;
  extraPoints: number;
}

export interface TableScores {
  [playerId: string]: number;
}

export interface Table {
  id: string;
  name: string;
  players: Player[];
  scores: TableScores;
}

export interface Round {
  roundNum: number;
  tables: Table[];
  isFinal: boolean;
}

export const getTableStructure = (totalPlayers: number) => {
  if (totalPlayers < 3) return null;

  let count4 = Math.floor(totalPlayers / 4);
  let remainder = totalPlayers % 4;

  let count5 = 0;
  let count3 = 0;

  if (remainder === 0) {
    // Perfect
  } else if (remainder === 1) {
    if (count4 >= 1) {
      count4--;
      count5++;
    }
  } else if (remainder === 2) {
    if (count4 >= 2) {
      count4 -= 2;
      count5 += 2;
    } else {
      count4 = 0;
      count5 = 0;
      count3 = 2;
    }
  } else if (remainder === 3) {
    if (count4 >= 3) {
      count4 -= 3;
      count5 += 3;
    } else {
      count3 = 1;
    }
  }

  return { 4: count4, 5: count5, 3: count3 };
};

export const generatePairings = (
  players: Player[],
  structure: any,
  pastPairings: Round[] = []
) => {
  let slots = [];
  for (let i = 0; i < structure[5]; i++) slots.push(5);
  for (let i = 0; i < structure[4]; i++) slots.push(4);
  for (let i = 0; i < structure[3]; i++) slots.push(3);

  let currentOrder = [...players].sort(() => Math.random() - 0.5);

  const calculateCost = (order: Player[]) => {
    let cost = 0;
    let index = 0;
    for (let size of slots) {
      const tablePlayers = order.slice(index, index + size);
      for (let i = 0; i < tablePlayers.length; i++) {
        for (let j = i + 1; j < tablePlayers.length; j++) {
          const p1 = tablePlayers[i].id;
          const p2 = tablePlayers[j].id;
          pastPairings.forEach((round) => {
            round.tables.forEach((table) => {
              const pIds = table.players.map((p) => p.id);
              if (pIds.includes(p1) && pIds.includes(p2)) {
                cost++;
              }
            });
          });
        }
      }
      index += size;
    }
    return cost;
  };

  let bestOrder = [...currentOrder];
  let minCost = calculateCost(bestOrder);

  for (let k = 0; k < 500; k++) {
    const idx1 = Math.floor(Math.random() * currentOrder.length);
    const idx2 = Math.floor(Math.random() * currentOrder.length);

    [currentOrder[idx1], currentOrder[idx2]] = [
      currentOrder[idx2],
      currentOrder[idx1],
    ];

    const newCost = calculateCost(currentOrder);
    if (newCost < minCost) {
      minCost = newCost;
      bestOrder = [...currentOrder];
    } else {
      [currentOrder[idx1], currentOrder[idx2]] = [
        currentOrder[idx2],
        currentOrder[idx1],
      ];
    }

    if (minCost === 0) break;
  }

  const tables = [];
  let index = 0;
  slots.forEach((size, i) => {
    tables.push({
      id: generateId(),
      name: `Table ${i + 1}`,
      players: bestOrder.slice(index, index + size),
      scores: {},
    });
    index += size;
  });

  return tables;
};

export const fetchGeminiContent = async (payload: any) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const maxRetries = 5;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429 && i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Received empty response from Gemini API.");
      }

      let sources = [];
      const groundingMetadata = candidate?.groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingAttributions) {
        sources = groundingMetadata.groundingAttributions
          .map((attribution: any) => ({
            uri: attribution.web?.uri,
            title: attribution.web?.title,
          }))
          .filter((source: any) => source.uri && source.title);
      }

      return { text, sources };
    } catch (error) {
      console.error(`Gemini API call failed (Attempt ${i + 1}):`, error);
      if (i === maxRetries - 1) {
        throw new Error(
          "Failed to connect to Gemini API after multiple retries."
        );
      }
    }
  }
};
