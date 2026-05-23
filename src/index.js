require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { handleMessage } = require('./handlers/messageHandler');
const { handleGroupJoin } = require('./handlers/groupHandler');

// ══════════════════════════════════════════
//   INITIALISATION DU CLIENT WHATSAPP
// ══════════════════════════════════════════
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'whatsapp-bot' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// ══════════════════════════════════════════
//   ÉVÉNEMENTS DU CLIENT
// ══════════════════════════════════════════

// Affichage du QR code pour la connexion
client.on('qr', (qr) => {
    console.log('\n📱 Scanne ce QR code avec WhatsApp :\n');
    qrcode.generate(qr, { small: true });
});

// Confirmation de connexion
client.on('ready', () => {
    console.log('✅ Bot WhatsApp connecté et prêt !');
    console.log(`🤖 Préfixe de commande : ${process.env.COMMAND_PREFIX || '!'}`);
    console.log('─'.repeat(40));
});

// Reconnexion automatique
client.on('disconnected', (reason) => {
    console.log('❌ Bot déconnecté :', reason);
    console.log('🔄 Tentative de reconnexion...');
    client.initialize();
});

// Réception des messages
client.on('message', async (message) => {
    await handleMessage(client, message);
});

// Nouveau membre dans un groupe
client.on('group_join', async (notification) => {
    await handleGroupJoin(client, notification);
});

// ══════════════════════════════════════════
//   DÉMARRAGE
// ══════════════════════════════════════════
console.log('🚀 Démarrage du bot WhatsApp...');
client.initialize();

module.exports = client;
