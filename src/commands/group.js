// ══════════════════════════════════════════
//   COMMANDES DE GROUPE
// ══════════════════════════════════════════

/**
 * !tagall [message]
 * Mentionne tous les membres du groupe
 */
async function tagAll(client, message, args) {
    const chat = await message.getChat();

    if (!chat.isGroup) {
        return message.reply('⚠️ Cette commande ne fonctionne que dans un *groupe* !');
    }

    // Vérifier que l'expéditeur est admin
    const sender = message.author || message.from;
    const participant = chat.participants.find(p => p.id._serialized === sender);

    if (!participant?.isAdmin && !participant?.isSuperAdmin) {
        return message.reply('🚫 Seuls les *admins* peuvent utiliser cette commande.');
    }

    const texteMessage = args.join(' ') || '📢 Attention tout le monde !';
    const membres = chat.participants;

    if (membres.length === 0) {
        return message.reply('❌ Aucun membre trouvé dans ce groupe.');
    }

    // Construire le message avec les mentions
    let mentions = [];
    let mentionText = '';

    for (const membre of membres) {
        const contact = await client.getContactById(membre.id._serialized);
        mentions.push(contact);
        mentionText += `@${membre.id.user} `;
    }

    const messageComplet = `📣 *${texteMessage}*\n\n👥 *${membres.length} membres tagués :*\n${mentionText}`;

    await chat.sendMessage(messageComplet, { mentions });
}

/**
 * !info
 * Affiche les informations du groupe
 */
async function groupInfo(client, message, args) {
    const chat = await message.getChat();

    if (!chat.isGroup) {
        return message.reply('⚠️ Cette commande ne fonctionne que dans un *groupe* !');
    }

    const admins = chat.participants.filter(p => p.isAdmin || p.isSuperAdmin);
    const membres = chat.participants.length;
    const creation = chat.groupMetadata?.creation
        ? new Date(chat.groupMetadata.creation * 1000).toLocaleDateString('fr-FR')
        : 'Inconnue';

    const infoMsg = `
📊 *Informations du groupe*

📌 *Nom :* ${chat.name}
👥 *Membres :* ${membres}
👑 *Admins :* ${admins.length}
📅 *Créé le :* ${creation}
🔒 *Annonces :* ${chat.groupMetadata?.announce ? 'Oui' : 'Non'}

👑 *Liste des admins :*
${admins.map(a => `• @${a.id.user}`).join('\n')}
    `.trim();

    const adminContacts = await Promise.all(
        admins.map(a => client.getContactById(a.id._serialized))
    );

    await chat.sendMessage(infoMsg, { mentions: adminContacts });
}

/**
 * !kick @membre
 * Expulse un membre du groupe (admin requis)
 */
async function kickMember(client, message, args) {
    const chat = await message.getChat();

    if (!chat.isGroup) {
        return message.reply('⚠️ Cette commande ne fonctionne que dans un *groupe* !');
    }

    const sender = message.author || message.from;
    const senderParticipant = chat.participants.find(p => p.id._serialized === sender);

    if (!senderParticipant?.isAdmin && !senderParticipant?.isSuperAdmin) {
        return message.reply('🚫 Seuls les *admins* peuvent utiliser !kick.');
    }

    // Récupérer les mentions du message
    const mentionedContacts = await message.getMentions();

    if (mentionedContacts.length === 0) {
        return message.reply('❌ Usage : *!kick @membre*\n\nMentionne le membre à expulser.');
    }

    let expelled = [];
    for (const contact of mentionedContacts) {
        try {
            await chat.removeParticipants([contact.id._serialized]);
            expelled.push(`@${contact.number}`);
        } catch {
            await message.reply(`⚠️ Impossible d'expulser @${contact.number} (vérifie les permissions).`);
        }
    }

    if (expelled.length > 0) {
        await message.reply(`✅ Membre(s) expulsé(s) : ${expelled.join(', ')}`);
    }
}

module.exports = { tagAll, groupInfo, kickMember };
