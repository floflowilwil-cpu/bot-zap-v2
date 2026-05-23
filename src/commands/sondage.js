// ══════════════════════════════════════════
//   COMMANDE : !sondage / !vote / !resultats
// ══════════════════════════════════════════

// Stockage en mémoire : Map<chatId, sondage>
const sondages = new Map();

/**
 * !sondage [question] | [option1] | [option2] | ...
 * Crée un sondage dans le groupe
 */
async function creerSondage(client, message, args) {
    const chat = await message.getChat();

    if (!chat.isGroup) {
        return message.reply('⚠️ Les sondages ne fonctionnent que dans un *groupe* !');
    }

    // Parser la question et les options séparées par |
    const fullText = args.join(' ');
    const parties = fullText.split('|').map(p => p.trim()).filter(Boolean);

    if (parties.length < 3) {
        return message.reply(
            '📊 *Créer un sondage*\n\n' +
            'Usage : `!sondage [question] | [option1] | [option2] | ...`\n\n' +
            '_Ex : !sondage Meilleur OS ? | Windows | Linux | macOS_\n\n' +
            '• Minimum 2 options requises\n' +
            '• Maximum 8 options'
        );
    }

    const question = parties[0];
    const options = parties.slice(1, 9); // max 8 options

    if (sondages.has(chat.id._serialized)) {
        return message.reply(
            '⚠️ Un sondage est déjà en cours dans ce groupe.\n\n' +
            'Tape *!resultats* pour voir les résultats ou *!stopsondage* pour l\'arrêter.'
        );
    }

    const emojisNumeros = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
    const createur = message.author || message.from;

    // Créer le sondage
    const sondage = {
        question,
        options,
        votes: {},        // { userId: indexOption }
        createur,
        dateCreation: new Date(),
        actif: true
    };
    sondages.set(chat.id._serialized, sondage);

    // Construire le message du sondage
    let msg = `📊 *SONDAGE*\n${'═'.repeat(28)}\n\n`;
    msg += `❓ *${question}*\n\n`;
    msg += `*Options :*\n`;
    options.forEach((opt, i) => {
        msg += `${emojisNumeros[i]} ${opt}\n`;
    });
    msg += `\n${'─'.repeat(28)}\n`;
    msg += `✍️ Vote avec : *!vote [numéro]*\n`;
    msg += `_Ex : !vote 1_\n\n`;
    msg += `📈 Résultats : *!resultats*\n`;
    msg += `🛑 Arrêter : *!stopsondage* _(admin)_`;

    await chat.sendMessage(msg);
}

/**
 * !vote [numéro]
 * Vote pour une option du sondage en cours
 */
async function voter(client, message, args) {
    const chat = await message.getChat();

    if (!sondages.has(chat.id._serialized)) {
        return message.reply('❌ Aucun sondage en cours dans ce groupe.\n\nCrée-en un avec *!sondage*.');
    }

    const sondage = sondages.get(chat.id._serialized);
    if (!sondage.actif) {
        return message.reply('🛑 Ce sondage est terminé. Tape *!resultats* pour voir les résultats finaux.');
    }

    const num = parseInt(args[0]);
    if (isNaN(num) || num < 1 || num > sondage.options.length) {
        return message.reply(
            `❌ Numéro invalide. Vote entre *1* et *${sondage.options.length}*.\n` +
            `_Ex : !vote 2_`
        );
    }

    const userId = message.author || message.from;
    const dejaVote = sondage.votes[userId] !== undefined;
    sondage.votes[userId] = num - 1;

    const emoji = dejaVote ? '🔄' : '✅';
    const action = dejaVote ? 'modifié' : 'enregistré';

    await message.reply(
        `${emoji} Vote *${action}* pour l'option ${num} : *${sondage.options[num - 1]}*\n\n` +
        `_Tape !resultats pour voir l'état du sondage._`
    );
}

/**
 * !resultats
 * Affiche les résultats du sondage en cours
 */
async function afficherResultats(client, message, args) {
    const chat = await message.getChat();

    if (!sondages.has(chat.id._serialized)) {
        return message.reply('❌ Aucun sondage en cours dans ce groupe.');
    }

    const sondage = sondages.get(chat.id._serialized);
    const totalVotes = Object.keys(sondage.votes).length;
    const emojisNumeros = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

    // Compter les votes par option
    const comptage = sondage.options.map((_, i) =>
        Object.values(sondage.votes).filter(v => v === i).length
    );

    const statut = sondage.actif ? '🟢 En cours' : '🔴 Terminé';
    let msg = `📊 *RÉSULTATS DU SONDAGE* — ${statut}\n${'═'.repeat(28)}\n\n`;
    msg += `❓ *${sondage.question}*\n\n`;

    sondage.options.forEach((opt, i) => {
        const nb = comptage[i];
        const pct = totalVotes > 0 ? Math.round((nb / totalVotes) * 100) : 0;
        const barres = Math.round(pct / 10); // barre sur 10
        const barre = '█'.repeat(barres) + '░'.repeat(10 - barres);

        msg += `${emojisNumeros[i]} *${opt}*\n`;
        msg += `   ${barre} ${pct}% (${nb} vote${nb > 1 ? 's' : ''})\n\n`;
    });

    msg += `${'─'.repeat(28)}\n`;
    msg += `👥 Total votes : *${totalVotes}*`;

    if (!sondage.actif && totalVotes > 0) {
        const maxVotes = Math.max(...comptage);
        const gagnants = sondage.options.filter((_, i) => comptage[i] === maxVotes);
        msg += `\n🏆 Gagnant${gagnants.length > 1 ? 's' : ''} : *${gagnants.join(', ')}*`;
    }

    await chat.sendMessage(msg);
}

/**
 * !stopsondage
 * Arrête le sondage en cours (admin requis)
 */
async function stopSondage(client, message, args) {
    const chat = await message.getChat();

    if (!sondages.has(chat.id._serialized)) {
        return message.reply('❌ Aucun sondage en cours.');
    }

    const sender = message.author || message.from;
    const participant = chat.participants?.find(p => p.id._serialized === sender);

    if (!participant?.isAdmin && !participant?.isSuperAdmin) {
        const sondage = sondages.get(chat.id._serialized);
        if (sondage.createur !== sender) {
            return message.reply('🚫 Seul le *créateur du sondage* ou un *admin* peut l\'arrêter.');
        }
    }

    const sondage = sondages.get(chat.id._serialized);
    sondage.actif = false;

    await message.reply('🛑 Sondage arrêté ! Voici les résultats finaux :');
    await afficherResultats(client, message, args);

    // Supprimer le sondage après 60 secondes
    setTimeout(() => sondages.delete(chat.id._serialized), 60000);
}

module.exports = { creerSondage, voter, afficherResultats, stopSondage };
