// ══════════════════════════════════════════
//   COMMANDES MULTIMÉDIA
// ══════════════════════════════════════════
const { MessageMedia } = require('whatsapp-web.js');

/**
 * !sticker
 * Convertit une image envoyée en sticker WhatsApp
 */
async function makeSticker(client, message, args) {
    let targetMessage = message;

    // Si c'est une réponse à un message avec image
    if (message.hasQuotedMsg) {
        targetMessage = await message.getQuotedMessage();
    }

    if (!targetMessage.hasMedia) {
        return message.reply('🎨 *Pour créer un sticker :*\n\n1. Envoie une image avec la commande *!sticker*\n_ou_\n2. Réponds à une image existante avec *!sticker*');
    }

    const media = await targetMessage.downloadMedia();

    if (!media || !media.mimetype.startsWith('image/')) {
        return message.reply('❌ Seules les *images* peuvent être converties en sticker.');
    }

    await message.reply(
        await targetMessage.reply(media, message.from, {
            sendMediaAsSticker: true,
            stickerName: 'WhatsApp Bot',
            stickerAuthor: 'Mon Bot'
        })
    ).catch(async () => {
        // Fallback : envoyer directement au chat
        const chat = await message.getChat();
        await chat.sendMessage(media, {
            sendMediaAsSticker: true,
            stickerName: 'WhatsApp Bot',
            stickerAuthor: 'Mon Bot'
        });
    });
}

module.exports = { makeSticker };
