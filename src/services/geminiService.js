import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MODEL = 'gemini-2.5-flash-lite';

/**
 * Build the system prompt for a player based on their performance data.
 * @param {Object} userData - Authenticated user data
 * @param {Object} performanceSummary - Performance summary from usePerformance
 * @param {Array} recentMatches - Recent match history
 * @returns {string}
 */
export const buildPlayerSystemPrompt = (userData, performanceSummary, recentMatches = []) => {
  const name = userData?.displayName || userData?.name || 'the player';
  const sport = userData?.sport || 'unknown sport';

  const score = performanceSummary?.currentScore ?? 'N/A';
  const avg = performanceSummary?.averageScore ?? 'N/A';
  const matches = performanceSummary?.matchCount ?? 0;
  const trend = performanceSummary?.trend ?? 'stable';

  const recentSummary = recentMatches.slice(0, 5).map((m, i) =>
    `  Match ${i + 1}: score ${Math.round(m.calculatedScore ?? 0)} on ${m.date ? new Date(m.date.seconds * 1000).toLocaleDateString() : 'recent date'}`
  ).join('\n');

  return `You are an expert sports performance coach and analyst assistant embedded in a Sports Performance Tracker app.

Player profile:
- Name: ${name}
- Sport: ${sport}
- Current performance score: ${score}/100
- Average score: ${avg}/100
- Total matches played: ${matches}
- Performance trend: ${trend}
${recentMatches.length > 0 ? `\nRecent match scores:\n${recentSummary}` : ''}

Your role:
- Help ${name} understand their performance data
- Give specific, actionable advice to improve their ${sport} performance
- Explain what their scores mean in practical terms
- Motivate and guide them with evidence-based suggestions
- Answer any questions about training, technique, recovery, or mental performance

Keep responses concise, encouraging, and sport-specific. Do not make up stats beyond what is provided.`;
};

/**
 * Build the system prompt for a coach based on their team data.
 * @param {Object} userData - Authenticated user data
 * @param {Array} players - List of players under the coach
 * @param {Object} teamStats - Aggregated team statistics
 * @returns {string}
 */
export const buildCoachSystemPrompt = (userData, players = [], teamStats = {}) => {
  const name = userData?.displayName || userData?.name || 'Coach';

  const playersSummary = players.slice(0, 10).map(p =>
    `  - ${p.name} (${p.sport}): current score ${Math.round(p.currentScore ?? p.averageScore ?? 0)}/100, ${p.matchCount ?? 0} matches`
  ).join('\n');

  return `You are an expert sports analytics assistant embedded in a Sports Performance Tracker app.

Coach profile:
- Name: ${name}
- Total players: ${teamStats.totalPlayers ?? players.length}
- Team average score: ${Math.round(teamStats.averageScore ?? 0)}/100
- Total matches logged: ${teamStats.totalMatches ?? 0}
${teamStats.topPerformer ? `- Top performer: ${teamStats.topPerformer.name}` : ''}
${players.length > 0 ? `\nPlayers:\n${playersSummary}` : ''}

Your role:
- Help ${name} analyse player and team performance
- Provide data-driven insights about players' strengths and weaknesses
- Suggest training plans, match strategies, and workload management
- Flag players who may need extra attention based on scores or trends
- Answer questions about sports science, coaching tactics, and performance metrics

Keep responses structured and analytical. Reference specific player names and scores when relevant.`;
};

/**
 * Create a new multi-turn chat session.
 * @param {string} systemPrompt - The system instruction for the session
 * @returns {Object} Gemini chat session
 */
export const createChatSession = (systemPrompt) => {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });

  return model.startChat({ history: [] });
};

/**
 * Send a message to an active chat session and return the response text.
 * @param {Object} chatSession - Active Gemini chat session
 * @param {string} message - User message
 * @returns {Promise<string>}
 */
export const sendMessage = async (chatSession, message) => {
  const result = await chatSession.sendMessage(message);
  return result.response.text();
};
