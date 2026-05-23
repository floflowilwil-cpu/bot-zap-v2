const Anthropic = require('@anthropic-ai/sdk');

// ══════════════════════════════════════════
//   MINI-JEUX : Quiz & Devinettes
// ══════════════════════════════════════════

const client_ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Parties en cours : Map<chatId, partieData>
const partiesQuiz = new Map();
const partiesDevinette = new Map();

// Scores globaux (en mémoire)
const scores = new Map(); // userId → { nom, points }

// ─────────────────────────────────────────
//   QUIZ
// ─────────────────────────────────────────

/**
 * !quiz [thème]
 * Lance un quiz avec une question générée par l'IA
 */
async function lancerQuiz(client, message, args) {
    const chat = await message.getChat();
    const chatId = chat.id._serialized;

    if (partiesQuiz.has(chatId)) {
        const partie = partiesQuiz.get(chatId);
        return message.reply(
            `⚠️ Un quiz est déjà en cours !\n\n` +
            `❓ *Question :* ${partie.question}\n\n` +
            `Réponds avec *!reponse [ta réponse]*`
        );
    }

    const theme = args.join(' ') || 'culture générale';

    // Générer une question via Claude AI
    const prompt = `Génère une question de quiz sur le thème "${theme}".
Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "question": "La question ici ?",
  "reponse": "La réponse correcte",
  "indice": "Un petit indice",
  "anecdote": "Une info intéressante sur la réponse"
}`;

    const response = await client_ai.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
    });

    let data;
    try {
        const text = response.content[0].text.replace(/```json|```/g, '').trim();
        data = JSON.parse(text);
    } catch {
        throw new Error('Impossible de générer une question. Réessaie.');
    }

    const partie = {
        question: data.question,
        reponse: data.reponse.toLowerCase().trim(),
        indice: data.indice,
        anecdote: data.anecdote,
        theme,
        tentatives: {},
        dateDebut: Date.now(),
        indiceUtilise: false
    };
    partiesQuiz.set(chatId, partie);

    // Timer : annuler après 2 minutes
    setTimeout(async () => {
        if (partiesQuiz.has(chatId)) {
            partiesQuiz.delete(chatId);
            await chat.sendMessage(
                `⏰ *Temps écoulé !*\n\n` +
                `La réponse était : *${data.reponse}*\n\n` +
                `_${data.anecdote}_`
            );
        }
    }, 120000);

    await chat.sendMessage(
        `🎮 *QUIZ — ${theme.toUpperCase()}*\n${'═'.repeat(28)}\n\n` +
        `❓ *${data.question}*\n\n` +
        `${'─'.repeat(28)}\n` +
        `✍️ Réponds avec : *!reponse [ta réponse]*\n` +
        `💡 Indice : *!indice*\n` +
        `⏰ Tu as *2 minutes* !\n` +
        `🏆 Scores : *!scores*`
    );
}

/**
 * !reponse [texte]
 * Vérifie la réponse au quiz ou devinette en cours
 */
async function verifierReponse(client, message, args) {
    const chat = await message.getChat();
    const chatId = chat.id._serialized;
    const userId = message.author || message.from;
    const reponseUser = args.join(' ').toLowerCase().trim();

    // Vérifier quiz
    if (partiesQuiz.has(chatId)) {
        const partie = partiesQuiz.get(chatId);

        if (partie.tentatives[userId] >= 3) {
            return message.reply('❌ Tu as déjà utilisé tes 3 tentatives pour cette question !');
        }
        partie.tentatives[userId] = (partie.tentatives[userId] || 0) + 1;

        // Vérification flexible (contient la réponse ou très proche)
        const correct = reponseUser.includes(partie.reponse) ||
                        partie.reponse.includes(reponseUser) ||
                        similarite(reponseUser, partie.reponse) > 0.8;

        if (correct) {
            partiesQuiz.delete(chatId);
            const contact = await message.getContact();
            const nom = contact.pushname || contact.number;

            // Ajouter les points
            ajouterScore(userId, nom, 10);

            await chat.sendMessage(
                `🎉 *BRAVO ${nom} !* Tu as trouvé !\n\n` +
                `✅ Réponse : *${partie.reponse}*\n\n` +
                `📚 _${partie.anecdote}_\n\n` +
                `🏆 +10 points ! Tape *!scores* pour le classement.`
            );
        } else {
            const restantes = 3 - partie.tentatives[userId];
            if (restantes === 0) {
                return message.reply(`❌ Plus de tentatives ! Attends que quelqu'un d'autre trouve ou que le temps expire.`);
            }
            await message.reply(
                `❌ Mauvaise réponse !\n` +
                `Il te reste *${restantes} tentative${restantes > 1 ? 's' : ''}*.\n` +
                `💡 Tape *!indice* si tu veux un coup de pouce.`
            );
        }
        return;
    }

    // Vérifier devinette
    if (partiesDevinette.has(chatId)) {
        const partie = partiesDevinette.get(chatId);

        const correct = reponseUser.includes(partie.reponse) ||
                        partie.reponse.includes(reponseUser) ||
                        similarite(reponseUser, partie.reponse) > 0.75;

        if (correct) {
            partiesDevinette.delete(chatId);
            const contact = await message.getContact();
            const nom = contact.pushname || contact.number;
            ajouterScore(userId, nom, 15);

            await chat.sendMessage(
                `🎉 *FÉLICITATIONS ${nom} !*\n\n` +
                `✅ La réponse était bien : *${partie.reponse}*\n\n` +
                `🏆 +15 points ! Tape *!scores* pour le classement.`
            );
        } else {
            await message.reply('❌ Ce n\'est pas ça... Réfléchis encore ! 🤔');
        }
        return;
    }

    await message.reply('❓ Aucun quiz ou devinette en cours.\n\nLance un quiz avec *!quiz* ou une devinette avec *!devine*.');
}

/**
 * !indice
 * Donne un indice pour le quiz en cours
 */
async function donnerIndice(client, message, args) {
    const chat = await message.getChat();
    const chatId = chat.id._serialized;

    if (!partiesQuiz.has(chatId)) {
        return message.reply('❓ Aucun quiz en cours. Lance-en un avec *!quiz*.');
    }

    const partie = partiesQuiz.get(chatId);
    if (partie.indiceUtilise) {
        return message.reply(`💡 Indice déjà donné : _${partie.indice}_`);
    }

    partie.indiceUtilise = true;
    await chat.sendMessage(`💡 *Indice :* _${partie.indice}_`);
}

// ─────────────────────────────────────────
//   DEVINETTES
// ─────────────────────────────────────────

/**
 * !devine
 * Lance une devinette générée par l'IA
 */
async function lancerDevinette(client, message, args) {
    const chat = await message.getChat();
    const chatId = chat.id._serialized;

    if (partiesDevinette.has(chatId)) {
        const partie = partiesDevinette.get(chatId);
        return message.reply(
            `⚠️ Une devinette est déjà en cours !\n\n` +
            `🧩 *${partie.devinette}*\n\n` +
            `Réponds avec *!reponse [ta réponse]*`
        );
    }

    const prompt = `Génère une devinette amusante en français.
Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "devinette": "Le texte de la devinette ici...",
  "reponse": "La réponse en un ou deux mots"
}`;

    const response = await client_ai.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
    });

    let data;
    try {
        const text = response.content[0].text.replace(/```json|```/g, '').trim();
        data = JSON.parse(text);
    } catch {
        throw new Error('Impossible de générer une devinette. Réessaie.');
    }

    partiesDevinette.set(chatId, {
        devinette: data.devinette,
        reponse: data.reponse.toLowerCase().trim(),
        dateDebut: Date.now()
    });

    // Timer : révéler après 3 minutes
    setTimeout(async () => {
        if (partiesDevinette.has(chatId)) {
            partiesDevinette.delete(chatId);
            await chat.sendMessage(
                `⏰ *Personne n'a trouvé !*\n\n` +
                `La réponse était : *${data.reponse}*`
            );
        }
    }, 180000);

    await chat.sendMessage(
        `🧩 *DEVINETTE*\n${'═'.repeat(28)}\n\n` +
        `${data.devinette}\n\n` +
        `${'─'.repeat(28)}\n` +
        `✍️ Réponds avec : *!reponse [ta réponse]*\n` +
        `⏰ Tu as *3 minutes* ! Bonne chance 🍀\n` +
        `🏆 +15 points pour le premier !`
    );
}

// ─────────────────────────────────────────
//   SCORES
// ─────────────────────────────────────────

function ajouterScore(userId, nom, points) {
    if (!scores.has(userId)) {
        scores.set(userId, { nom, points: 0 });
    }
    scores.get(userId).points += points;
    scores.get(userId).nom = nom; // Mettre à jour le nom
}

/**
 * !scores
 * Affiche le classement général
 */
async function afficherScores(client, message, args) {
    if (scores.size === 0) {
        return message.reply('🏆 Aucun score enregistré pour l\'instant.\n\nJoue avec *!quiz* ou *!devine* pour gagner des points !');
    }

    const classement = [...scores.entries()]
        .sort((a, b) => b[1].points - a[1].points)
        .slice(0, 10);

    const medailles = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    let msg = `🏆 *CLASSEMENT MINI-JEUX*\n${'═'.repeat(28)}\n\n`;
    classement.forEach(([, data], i) => {
        msg += `${medailles[i]} *${data.nom}* — ${data.points} pts\n`;
    });
    msg += `\n${'─'.repeat(28)}\n`;
    msg += `Quiz : *!quiz [thème]* (+10 pts)\n`;
    msg += `Devinette : *!devine* (+15 pts)`;

    await message.reply(msg);
}

// ─────────────────────────────────────────
//   UTILITAIRE : Similarité entre deux chaînes
// ─────────────────────────────────────────
function similarite(s1, s2) {
    if (s1 === s2) return 1;
    if (s1.length < 2 || s2.length < 2) return 0;
    const bigrams = new Map();
    for (let i = 0; i < s1.length - 1; i++) {
        const b = s1.substr(i, 2);
        bigrams.set(b, (bigrams.get(b) || 0) + 1);
    }
    let intersect = 0;
    for (let i = 0; i < s2.length - 1; i++) {
        const b = s2.substr(i, 2);
        if (bigrams.has(b) && bigrams.get(b) > 0) {
            bigrams.set(b, bigrams.get(b) - 1);
            intersect++;
        }
    }
    return (2 * intersect) / (s1.length + s2.length - 2);
}

module.exports = { lancerQuiz, verifierReponse, donnerIndice, lancerDevinette, afficherScores };
