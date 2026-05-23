const { PREFIX, LOADING_EMOJI, EMOJIS } = require('../utils/constants');
const { estAutorise }                    = require('../utils/permissions');
const meteoCmd   = require('../commands/meteo');
const newsCmd    = require('../commands/news');
const aiCmd      = require('../commands/ai');
const calcCmd    = require('../commands/calc');
const groupCmd   = require('../commands/group');
const mediaCmd   = require('../commands/media');
const helpCmd    = require('../commands/help');
const ytCmd      = require('../commands/youtube');
const sondageCmd = require('../commands/sondage');
const tradCmd    = require('../commands/traduction');
const jeuxCmd    = require('../commands/jeux');
const permsCmd   = require('../commands/permissions');

// ══════════════════════════════════════════
//   HANDLER PRINCIPAL DES MESSAGES
// ══════════════════════════════════════════
async function handleMessage(client, message) {
    const body = message.body?.trim();
    if (!body) return;

    const prefix = process.env.COMMAND_PREFIX || PREFIX;
    if (!body.startsWith(prefix)) return;

    const args    = body.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    console.log(`📩 Commande reçue : ${prefix}${command} | Args : ${args.join(' ')}`);

    // ── Réaction emoji de chargement ──────────
    try { await message.react(LOADING_EMOJI); } catch {}

    try {
        // ══════════════════════════════════════
        //   COMMANDES DE PERMISSIONS
        //   Toujours accessibles (pour que l'admin
        //   puisse gérer sans être bloqué lui-même)
        // ══════════════════════════════════════
        if (['allow', 'autoriser'].includes(command)) {
            await permsCmd.allowCmd(client, message, args);
            return await message.react(EMOJIS.success);
        }
        if (['revoke', 'revoquer', 'retirer', 'bloquer'].includes(command)) {
            await permsCmd.revokeCmd(client, message, args);
            return await message.react(EMOJIS.success);
        }
        if (['liste', 'perms', 'permissions'].includes(command)) {
            await permsCmd.listeCmd(client, message, args);
            return await message.react(EMOJIS.success);
        }

        // ══════════════════════════════════════
        //   VÉRIFICATION DES PERMISSIONS
        //   Bloquer les utilisateurs non autorisés
        // ══════════════════════════════════════
        const userId = message.author || message.from;
        if (!estAutorise(userId)) {
            await message.react(EMOJIS.error);
            return await message.reply(
                '╔════════════════════════════╗\n' +
                '║   🔒  ACCÈS RESTREINT      ║\n' +
                '╚════════════════════════════╝\n\n' +
                'Tu n\'as pas la permission d\'utiliser ce bot.\n\n' +
                '_Contacte un administrateur pour obtenir l\'accès._'
            );
        }

        // ══════════════════════════════════════
        //   ROUTING DES COMMANDES
        // ══════════════════════════════════════
        switch (command) {

            // ── Aide ─────────────────────────
            case 'aide':
            case 'help':
            case 'menu':
                await helpCmd(client, message, args);
                break;

            // ── Météo ─────────────────────────
            case 'meteo':
            case 'météo':
            case 'weather':
                await meteoCmd(client, message, args);
                break;

            // ── News ──────────────────────────
            case 'news':
            case 'actu':
            case 'actualites':
                await newsCmd(client, message, args);
                break;

            // ── IA ────────────────────────────
            case 'ai':
            case 'ia':
            case 'gpt':
            case 'claude':
                await aiCmd(client, message, args);
                break;

            // ── Calcul ────────────────────────
            case 'calc':
            case 'calcul':
                await calcCmd(client, message, args);
                break;

            // ── Groupe ────────────────────────
            case 'tagall':
            case 'mentionall':
            case 'tout':
                await groupCmd.tagAll(client, message, args);
                break;

            case 'info':
            case 'groupinfo':
                await groupCmd.groupInfo(client, message, args);
                break;

            case 'kick':
                await groupCmd.kickMember(client, message, args);
                break;

            // ── Média ─────────────────────────
            case 'sticker':
            case 'stick':
                await mediaCmd.makeSticker(client, message, args);
                break;

            // ── YouTube ───────────────────────
            case 'yt':
            case 'youtube':
            case 'dl':
                await ytCmd(client, message, args);
                break;

            // ── Sondages ──────────────────────
            case 'sondage':
            case 'poll':
                await sondageCmd.creerSondage(client, message, args);
                break;

            case 'vote':
                await sondageCmd.voter(client, message, args);
                break;

            case 'resultats':
            case 'résultats':
                await sondageCmd.afficherResultats(client, message, args);
                break;

            case 'stopsondage':
            case 'stoppoll':
                await sondageCmd.stopSondage(client, message, args);
                break;

            // ── Traduction ────────────────────
            case 'trad':
            case 'traduction':
            case 'translate':
                await tradCmd(client, message, args);
                break;

            // ── Mini-jeux ─────────────────────
            case 'quiz':
                await jeuxCmd.lancerQuiz(client, message, args);
                break;

            case 'devine':
            case 'devinette':
                await jeuxCmd.lancerDevinette(client, message, args);
                break;

            case 'reponse':
            case 'réponse':
            case 'rep':
                await jeuxCmd.verifierReponse(client, message, args);
                break;

            case 'indice':
                await jeuxCmd.donnerIndice(client, message, args);
                break;

            case 'scores':
            case 'classement':
                await jeuxCmd.afficherScores(client, message, args);
                break;

            default:
                await message.react(EMOJIS.error);
                await message.reply(
                    `❓ Commande *${prefix}${command}* inconnue.\n\n` +
                    `Tape *${prefix}aide* pour voir toutes les commandes disponibles.`
                );
        }

        await message.react(EMOJIS.success);

    } catch (error) {
        console.error(`❌ Erreur commande ${command} :`, error.message);
        await message.react(EMOJIS.error);
        await message.reply(
            `⚠️ Erreur lors de *${prefix}${command}*\n\n_${error.message}_`
        );
    }
}

module.exports = { handleMessage };
