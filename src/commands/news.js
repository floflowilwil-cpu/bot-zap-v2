const axios = require('axios');

// ══════════════════════════════════════════
//   COMMANDE : !news [sujet]
// ══════════════════════════════════════════
module.exports = async function newsCmd(client, message, args) {
    const sujet = args.join(' ') || 'Cameroun';
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey || apiKey === 'ta_cle_news_ici') {
        return message.reply('⚠️ Clé API News non configurée. Ajoute NEWS_API_KEY dans le fichier .env');
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(sujet)}&language=fr&pageSize=5&sortBy=publishedAt&apiKey=${apiKey}`;
    const data = (await axios.get(url)).data;

    if (!data.articles || data.articles.length === 0) {
        return message.reply(`📰 Aucune actualité trouvée pour *"${sujet}"*.`);
    }

    let reponse = `📰 *Top actualités — ${sujet}*\n${'─'.repeat(30)}\n\n`;

    data.articles.slice(0, 5).forEach((article, i) => {
        const date = new Date(article.publishedAt).toLocaleDateString('fr-FR');
        reponse += `*${i + 1}.* ${article.title}\n`;
        reponse += `   📅 ${date} — _${article.source.name}_\n`;
        reponse += `   🔗 ${article.url}\n\n`;
    });

    await message.reply(reponse.trim());
};
