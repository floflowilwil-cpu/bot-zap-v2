const axios = require('axios');

// ══════════════════════════════════════════
//   COMMANDE : !trad [langue] [texte]
//              ou répondre à un message avec !trad [langue]
// ══════════════════════════════════════════

// Langues supportées (codes ISO 639-1)
const LANGUES = {
    'fr': 'Français', 'en': 'Anglais', 'es': 'Espagnol',
    'de': 'Allemand', 'it': 'Italien', 'pt': 'Portugais',
    'ar': 'Arabe',    'zh': 'Chinois', 'ja': 'Japonais',
    'ru': 'Russe',    'ko': 'Coréen',  'nl': 'Néerlandais',
    'pl': 'Polonais', 'tr': 'Turc',    'vi': 'Vietnamien',
    'ha': 'Haoussa',  'yo': 'Yoruba',  'sw': 'Swahili',
};

module.exports = async function tradCmd(client, message, args) {
    if (args.length === 0) {
        const langList = Object.entries(LANGUES)
            .map(([code, nom]) => `  \`${code}\` → ${nom}`)
            .join('\n');
        return message.reply(
            '🌍 *Traduction automatique*\n\n' +
            '*Usage :*\n' +
            '• `!trad [langue] [texte]`\n' +
            '• Ou réponds à un message avec `!trad [langue]`\n\n' +
            '_Ex : !trad en Bonjour tout le monde_\n' +
            '_Ex : !trad fr Hello everyone_\n\n' +
            '*Langues disponibles :*\n' + langList
        );
    }

    const cibleCode = args[0].toLowerCase();
    if (!LANGUES[cibleCode]) {
        return message.reply(
            `❌ Langue *"${cibleCode}"* non reconnue.\n\n` +
            `Tape *!trad* pour voir la liste des langues disponibles.`
        );
    }

    // Récupérer le texte à traduire
    let texte = args.slice(1).join(' ');

    // Si pas de texte mais message cité → traduire le message cité
    if (!texte && message.hasQuotedMsg) {
        const quoted = await message.getQuotedMessage();
        texte = quoted.body;
    }

    if (!texte) {
        return message.reply(
            `❌ Aucun texte à traduire.\n\n` +
            `Écris le texte après la langue : _!trad ${cibleCode} [ton texte]_\n` +
            `Ou réponds à un message avec : _!trad ${cibleCode}_`
        );
    }

    // Utiliser MyMemory API (gratuite, pas de clé requise)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texte)}&langpair=auto|${cibleCode}`;
    const data = (await axios.get(url)).data;

    if (data.responseStatus !== 200) {
        throw new Error('Service de traduction indisponible');
    }

    const traduction = data.responseData.translatedText;
    const langueDetectee = data.responseData.detectedLanguage || 'auto';
    const nomCible = LANGUES[cibleCode];

    await message.reply(
        `🌍 *Traduction → ${nomCible}*\n\n` +
        `📝 *Original :*\n_${texte}_\n\n` +
        `✅ *Traduction :*\n${traduction}`
    );
};
