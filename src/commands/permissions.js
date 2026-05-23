const { autoriser, revoquer, listerAutorises, estAdmin, isSuperAdmin } = require('../utils/permissions');

// ══════════════════════════════════════════
//   COMMANDES DE GESTION DES PERMISSIONS
//   Réservées au super-admin et aux admins bot
// ══════════════════════════════════════════

/**
 * !allow [@mention | reply]
 * Donne accès au bot à un ou plusieurs utilisateurs
 *
 * Modes :
 *  1. !allow @user1 @user2 ...  → mentionne les cibles
 *  2. Répondre à un message     → cible l'auteur du message
 *  3. !allow admin @user        → donne le rôle admin bot
 */
async function allowCmd(client, message, args) {
    const senderId = message.author || message.from;

    // Seul le super-admin ou un admin bot peut donner des permissions
    if (!estAdmin(senderId)) {
        return message.reply(
            '╔═══════════════════════╗\n' +
            '║   🚫  ACCÈS REFUSÉ    ║\n' +
            '╚═══════════════════════╝\n\n' +
            'Seuls les *admins du bot* peuvent gérer les permissions.'
        );
    }

    const enAdmin = args[0]?.toLowerCase() === 'admin';
    if (enAdmin) args.shift(); // retirer le mot "admin" des args

    const cibles = await getCibles(client, message, args);

    if (cibles.length === 0) {
        return message.reply(
            '📋 *Utilisation de !allow*\n\n' +
            '• `!allow @user` → autorise un utilisateur\n' +
            '• `!allow @u1 @u2 @u3` → autorise plusieurs\n' +
            '• Réponds à un message + `!allow` → autorise l\'auteur\n' +
            '• `!allow admin @user` → donne le rôle admin bot\n\n' +
            '_Exemple : !allow @Jean @Marie_'
        );
    }

    // Bloquer l'autorisation sur soi-même
    const ciblesSansSoi = cibles.filter(c => c.id !== senderId);
    if (ciblesSansSoi.length === 0) {
        return message.reply('⚠️ Tu ne peux pas modifier tes propres permissions.');
    }

    const ajoutes = autoriser(ciblesSansSoi.map(c => c.id), enAdmin);
    const role = enAdmin ? 'Admin bot 👑' : 'Utilisateur ✅';

    if (ajoutes.length === 0) {
        return message.reply('ℹ️ Ces utilisateurs ont *déjà accès* au bot.');
    }

    const noms = ciblesSansSoi.map(c => `• @${c.numero}`).join('\n');
    const mentions = ciblesSansSoi.map(c => c.contact);

    await message.reply(
        '╔══════════════════════════╗\n' +
        '║   ✅  ACCÈS ACCORDÉ      ║\n' +
        '╚══════════════════════════╝\n\n' +
        `👤 *Rôle :* ${role}\n\n` +
        `*Utilisateurs autorisés :*\n${noms}\n\n` +
        `_Ils peuvent maintenant utiliser toutes les commandes du bot._`,
        { mentions }
    );
}

/**
 * !revoke [@mention | reply]
 * Retire l'accès au bot d'un utilisateur
 */
async function revokeCmd(client, message, args) {
    const senderId = message.author || message.from;

    if (!estAdmin(senderId)) {
        return message.reply(
            '╔═══════════════════════╗\n' +
            '║   🚫  ACCÈS REFUSÉ    ║\n' +
            '╚═══════════════════════╝\n\n' +
            'Seuls les *admins du bot* peuvent révoquer des permissions.'
        );
    }

    const cibles = await getCibles(client, message, args);

    if (cibles.length === 0) {
        return message.reply(
            '📋 *Utilisation de !revoke*\n\n' +
            '• `!revoke @user` → retire l\'accès\n' +
            '• Réponds à un message + `!revoke` → retire l\'accès à l\'auteur\n\n' +
            '_Exemple : !revoke @Jean_'
        );
    }

    // Empêcher de révoquer le super-admin
    const ciblesSures = cibles.filter(c => !isSuperAdmin(c.id) && c.id !== senderId);
    if (ciblesSures.length === 0) {
        return message.reply('⚠️ Impossible de révoquer le super-admin ou toi-même.');
    }

    const retires = revoquer(ciblesSures.map(c => c.id));

    if (retires.length === 0) {
        return message.reply('ℹ️ Ces utilisateurs n\'avaient *pas accès* au bot.');
    }

    const noms = ciblesSures.map(c => `• @${c.numero}`).join('\n');
    const mentions = ciblesSures.map(c => c.contact);

    await message.reply(
        '╔══════════════════════════╗\n' +
        '║   🚫  ACCÈS RÉVOQUÉ      ║\n' +
        '╚══════════════════════════╝\n\n' +
        `*Utilisateurs retirés :*\n${noms}`,
        { mentions }
    );
}

/**
 * !liste
 * Affiche tous les utilisateurs autorisés
 */
async function listeCmd(client, message, args) {
    const senderId = message.author || message.from;

    if (!estAdmin(senderId)) {
        return message.reply('🚫 Seuls les *admins du bot* peuvent voir la liste des permissions.');
    }

    const db = listerAutorises();
    const totalAdmins = db.admins.length;
    const totalUsers  = db.autorises.length;

    if (totalAdmins === 0 && totalUsers === 0) {
        return message.reply(
            '📋 *Liste des permissions*\n\n' +
            'Aucun utilisateur autorisé pour l\'instant.\n\n' +
            '_Utilise !allow @user pour donner accès._'
        );
    }

    let msg = '╔══════════════════════════╗\n';
    msg    += '║   📋  PERMISSIONS BOT    ║\n';
    msg    += '╚══════════════════════════╝\n\n';

    if (totalAdmins > 0) {
        msg += `👑 *Admins bot (${totalAdmins})* :\n`;
        db.admins.forEach(id => {
            const numero = id.replace('@c.us', '');
            msg += `  • @${numero}\n`;
        });
        msg += '\n';
    }

    if (totalUsers > 0) {
        msg += `✅ *Utilisateurs autorisés (${totalUsers})* :\n`;
        db.autorises.forEach(id => {
            const numero = id.replace('@c.us', '');
            msg += `  • @${numero}\n`;
        });
    }

    msg += '\n─────────────────────────\n';
    msg += `📊 Total : *${totalAdmins + totalUsers}* utilisateurs\n\n`;
    msg += '• `!allow @user` → donner accès\n';
    msg += '• `!revoke @user` → retirer accès';

    await message.reply(msg);
}

// ══════════════════════════════════════════
//   UTILITAIRE : Récupérer les cibles
//   depuis les mentions ou le message cité
// ══════════════════════════════════════════
async function getCibles(client, message, args) {
    const cibles = [];

    // Mode 1 : mentions dans le message
    const mentionnes = await message.getMentions();
    for (const contact of mentionnes) {
        cibles.push({
            id:      contact.id._serialized,
            numero:  contact.number,
            contact: contact
        });
    }

    // Mode 2 : réponse à un message (si pas de mentions)
    if (cibles.length === 0 && message.hasQuotedMsg) {
        const quoted  = await message.getQuotedMessage();
        const auteurId = quoted.author || quoted.from;
        try {
            const contact = await client.getContactById(auteurId);
            cibles.push({
                id:      auteurId,
                numero:  contact.number,
                contact: contact
            });
        } catch {
            // Contact non récupérable
        }
    }

    return cibles;
}

module.exports = { allowCmd, revokeCmd, listeCmd };
