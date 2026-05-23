// ══════════════════════════════════════════
//   COMMANDE : !aide / !help / !menu
// ══════════════════════════════════════════
module.exports = async function helpCmd(client, message, args) {
    const p = process.env.COMMAND_PREFIX || '!';

    // Aide détaillée par catégorie : !help groupe, !help jeux, etc.
    const categorie = args[0]?.toLowerCase();

    if (categorie) {
        return await helpCategorie(message, p, categorie);
    }

    // ── Menu principal ────────────────────────────
    const menu =
`╔══════════════════════════════╗
║   🤖  BOT WHATSAPP — MENU   ║
╚══════════════════════════════╝

🌤️  *MÉTÉO*         → ${p}meteo [ville]
📰  *ACTUALITÉS*    → ${p}news [sujet]
🤖  *INTELLIGENCE*  → ${p}ai [question]
🧮  *CALCULATRICE*  → ${p}calc [expression]
🎵  *YOUTUBE*       → ${p}yt [url] audio/video
🌍  *TRADUCTION*    → ${p}trad [langue] [texte]
👥  *GROUPE*        → ${p}tagall / ${p}info / ${p}kick
🎨  *MULTIMÉDIA*    → ${p}sticker
📊  *SONDAGES*      → ${p}sondage / ${p}vote
🎮  *MINI-JEUX*     → ${p}quiz / ${p}devine
🔐  *PERMISSIONS*   → ${p}allow / ${p}revoke _(admin)_

──────────────────────────────
💡 *Aide détaillée par module :*
_${p}help meteo • ${p}help jeux • ${p}help groupe_
_${p}help sondage • ${p}help trad • ${p}help perms_

⏳ _Chaque commande réagit avec une animation de chargement._`;

    await message.reply(menu);
};

// ── Aide par catégorie ────────────────────────────
async function helpCategorie(message, p, cat) {
    const pages = {

        meteo: `╔══════════════════════╗
║   🌤️  MÉTÉO          ║
╚══════════════════════╝

*Commande :* ${p}meteo [ville]
*Alias :* ${p}weather

Affiche la météo en temps réel :
température, ressenti, humidité,
vent et conditions générales.

*Exemples :*
  • ${p}meteo Yaoundé
  • ${p}meteo Paris
  • ${p}meteo New York`,

        news: `╔══════════════════════╗
║   📰  ACTUALITÉS     ║
╚══════════════════════╝

*Commande :* ${p}news [sujet]
*Alias :* ${p}actu

Affiche les 5 dernières actualités
sur le sujet choisi avec date,
source et lien.

*Exemples :*
  • ${p}news Cameroun
  • ${p}news Intelligence artificielle
  • ${p}news Football`,

        jeux: `╔══════════════════════╗
║   🎮  MINI-JEUX      ║
╚══════════════════════╝

*QUIZ* (+10 pts)
  ${p}quiz [thème] → question générée par IA
  ${p}reponse [texte] → ta réponse
  ${p}indice → demande un indice
  ⏰ Tu as 2 minutes par question

*DEVINETTES* (+15 pts)
  ${p}devine → devinette aléatoire
  ${p}reponse [texte] → ta réponse
  ⏰ Tu as 3 minutes

*SCORES*
  ${p}scores → classement général 🏆

*Exemples :*
  • ${p}quiz géographie
  • ${p}quiz sport
  • ${p}devine`,

        groupe: `╔══════════════════════╗
║   👥  GROUPE         ║
╚══════════════════════╝

*Commandes admins :*

${p}tagall [message]
→ Mentionne tous les membres
→ _Ex : ${p}tagall Réunion ce soir !_

${p}info
→ Stats du groupe (membres, admins,
  date de création, restrictions)

${p}kick @membre
→ Expulse le membre mentionné

*Message de bienvenue :*
→ Automatique quand un nouveau
  membre rejoint le groupe`,

        sondage: `╔══════════════════════╗
║   📊  SONDAGES       ║
╚══════════════════════╝

*Créer un sondage :*
${p}sondage [question] | [opt1] | [opt2]...
→ Sépare les options avec |
→ Max 8 options, 1 seul sondage à la fois

*Voter :*
${p}vote [numéro]
→ _Ex : ${p}vote 2_
→ Tu peux changer ton vote

*Résultats :*
${p}resultats → barres de progression en direct

*Clôturer :*
${p}stopsondage → affiche le gagnant _(admin/créateur)_

*Exemple complet :*
_${p}sondage Meilleur OS ? | Windows | Linux | macOS_`,

        trad: `╔══════════════════════╗
║   🌍  TRADUCTION     ║
╚══════════════════════╝

*Commande :* ${p}trad [langue] [texte]
*Alias :* ${p}translate

→ Traduit le texte dans la langue choisie
→ Ou réponds à un message avec ${p}trad [langue]

*Codes de langue :*
fr=Français   en=Anglais   es=Espagnol
de=Allemand   ar=Arabe     zh=Chinois
pt=Portugais  ru=Russe     sw=Swahili
ha=Haoussa    yo=Yoruba    ja=Japonais

*Exemples :*
  • ${p}trad en Bonjour tout le monde
  • ${p}trad ar Comment vas-tu ?
  • _(en réponse à un message)_ ${p}trad fr`,

        perms: `╔══════════════════════╗
║   🔐  PERMISSIONS    ║
╚══════════════════════╝

*Réservé aux admins bot*

*Donner l'accès :*
${p}allow @user
${p}allow @u1 @u2 @u3
→ Ou réponds à un message avec ${p}allow

*Rôle admin bot :*
${p}allow admin @user
→ Peut gérer les permissions

*Retirer l'accès :*
${p}revoke @user
→ Ou réponds à un message avec ${p}revoke

*Voir la liste :*
${p}liste → tous les utilisateurs autorisés

*Note :* Le super-admin (défini dans .env)
a toujours accès, quoi qu'il arrive.`,

    };

    const contenu = pages[cat] || pages[cat.replace('é','e').replace('è','e')];
    if (!contenu) {
        return message.reply(
            `❓ Module *"${cat}"* non reconnu.\n\n` +
            `Modules disponibles :\n` +
            `_meteo • news • jeux • groupe • sondage • trad • perms_`
        );
    }

    await message.reply(contenu);
}
