const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

// ══════════════════════════════════════════
//   COMMANDE : !yt [url] [audio|video]
// ══════════════════════════════════════════
module.exports = async function ytCmd(client, message, args) {
    const url = args[0];
    const format = (args[1] || 'audio').toLowerCase();

    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
        return message.reply(
            '🎵 *Téléchargement YouTube*\n\n' +
            'Usage :\n' +
            '• `!yt [url] audio` → MP3 (défaut)\n' +
            '• `!yt [url] video` → MP4\n\n' +
            '_Ex : !yt https://youtu.be/xxxxx audio_'
        );
    }

    if (!['audio', 'video'].includes(format)) {
        return message.reply('❌ Format invalide. Utilise *audio* ou *video*.');
    }

    // Vérifier que yt-dlp est installé
    try {
        execSync('yt-dlp --version', { stdio: 'ignore' });
    } catch {
        return message.reply(
            '⚠️ *yt-dlp non installé sur le serveur.*\n\n' +
            'L\'administrateur doit exécuter :\n`pip install yt-dlp`'
        );
    }

    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const outputTemplate = path.join(tmpDir, '%(title)s.%(ext)s');
    let outputFile = null;

    try {
        if (format === 'audio') {
            // Télécharger en MP3 (max 5 minutes pour WhatsApp)
            execSync(
                `yt-dlp -x --audio-format mp3 --audio-quality 5 ` +
                `--match-filter "duration < 300" ` +
                `-o "${outputTemplate}" "${url}"`,
                { timeout: 60000 }
            );
            // Trouver le fichier généré
            outputFile = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp3'));
        } else {
            // Télécharger en MP4 720p max
            execSync(
                `yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]" ` +
                `--match-filter "duration < 180" ` +
                `-o "${outputTemplate}" "${url}"`,
                { timeout: 120000 }
            );
            outputFile = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp4'));
        }

        if (!outputFile) throw new Error('Fichier non généré');

        const filePath = path.join(tmpDir, outputFile);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

        // WhatsApp limite les fichiers à ~64MB
        if (stats.size > 64 * 1024 * 1024) {
            fs.unlinkSync(filePath);
            return message.reply('❌ Fichier trop volumineux pour WhatsApp (max 64MB).\n\nEssaie une vidéo plus courte.');
        }

        const media = MessageMedia.fromFilePath(filePath);
        const titre = outputFile.replace(/\.(mp3|mp4)$/, '');

        await message.reply(media, null, {
            caption: `🎵 *${titre}*\n📁 ${sizeMB} MB — Format : ${format.toUpperCase()}`
        });

        // Nettoyer le fichier temporaire
        fs.unlinkSync(filePath);

    } catch (err) {
        // Nettoyer en cas d'erreur
        if (outputFile) {
            const fp = path.join(tmpDir, outputFile);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }

        if (err.message.includes('duration')) {
            return message.reply(
                '❌ Vidéo trop longue !\n\n' +
                '• Audio : max *5 minutes*\n' +
                '• Vidéo : max *3 minutes*'
            );
        }

        throw new Error('Impossible de télécharger cette vidéo. Vérifie l\'URL ou réessaie.');
    }
};
