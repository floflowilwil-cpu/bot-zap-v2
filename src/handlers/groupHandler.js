// ══════════════════════════════════════════
//   HANDLER ÉVÉNEMENTS DE GROUPE
// ══════════════════════════════════════════
async function handleGroupJoin(client, notification) {
    const chat = await notification.getChat();
    const contact = await notification.getContact();

    const welcomeMsg = `
🎉 *Bienvenue dans le groupe !*

Salut @${contact.number} ! 👋
Content de t'avoir parmi nous dans *${chat.name}*.

Tape *!aide* pour voir ce que je peux faire pour toi 🤖
    `.trim();

    await chat.sendMessage(welcomeMsg, {
        mentions: [contact]
    });
}

module.exports = { handleGroupJoin };
