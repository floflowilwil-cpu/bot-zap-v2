const Anthropic = require('@anthropic-ai/sdk');

const client_ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Historique de conversation par utilisateur (en mémoire)
const conversations = new Map();

// ══════════════════════════════════════════
//   COMMANDE : !ai [question]
// ══════════════════════════════════════════
module.exports = async function aiCmd(client, message, args) {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'ta_cle_anthropic_ici') {
        return message.reply('⚠️ Clé API Anthropic non configurée. Ajoute ANTHROPIC_API_KEY dans le fichier .env');
    }

    const question = args.join(' ');
    if (!question) {
        return message.reply('🤖 Usage : *!ai [ta question]*\n\nExemple : _!ai Explique-moi la photosynthèse_');
    }

    const userId = message.from;

    // Gérer l'historique de conversation (max 10 tours)
    if (!conversations.has(userId)) {
        conversations.set(userId, []);
    }
    const history = conversations.get(userId);

    // Commande reset conversation
    if (question.toLowerCase() === 'reset' || question.toLowerCase() === 'nouveau') {
        conversations.set(userId, []);
        return message.reply('🔄 Conversation réinitialisée ! Tu peux repartir de zéro.');
    }

    history.push({ role: 'user', content: question });

    const response = await client_ai.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Tu es un assistant WhatsApp intelligent, sympa et concis. 
Tu réponds en français sauf si on te parle autrement. 
Tes réponses sont adaptées au format WhatsApp : pas trop longues, bien structurées avec des emojis si pertinent.
Ne mets pas de markdown complexe, préfère le gras (*texte*) et l'italique (_texte_) de WhatsApp.`,
        messages: history.slice(-10) // Garder max 10 messages d'historique
    });

    const reponse = response.content[0].text;
    history.push({ role: 'assistant', content: reponse });

    // Limiter l'historique à 20 messages
    if (history.length > 20) history.splice(0, 2);

    await message.reply(`🤖 *Claude AI*\n\n${reponse}`);
};
