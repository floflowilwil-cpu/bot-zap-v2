// ══════════════════════════════════════════
//   DESIGN SYSTEM — Templates visuels
//   Tous les messages du bot passent ici
// ══════════════════════════════════════════

const D = {

    // ── Séparateurs ───────────────────────────
    LINE:  '─'.repeat(30),
    DLINE: '═'.repeat(30),
    WAVE:  '〰'.repeat(10),

    // ── En-têtes de section ───────────────────
    header(emoji, titre) {
        return `${emoji} *${titre.toUpperCase()}*\n${this.DLINE}`;
    },

    subheader(emoji, titre) {
        return `${emoji} *${titre}*\n${this.LINE}`;
    },

    // ── Boîtes de statut ──────────────────────
    success(titre, corps) {
        return (
            `┌─────────────────────────┐\n` +
            `│  ✅  ${titre.padEnd(20)}│\n` +
            `└─────────────────────────┘\n\n` +
            corps
        );
    },

    error(titre, corps) {
        return (
            `┌─────────────────────────┐\n` +
            `│  ❌  ${titre.padEnd(20)}│\n` +
            `└─────────────────────────┘\n\n` +
            corps
        );
    },

    warning(titre, corps) {
        return (
            `┌─────────────────────────┐\n` +
            `│  ⚠️   ${titre.padEnd(19)}│\n` +
            `└─────────────────────────┘\n\n` +
            corps
        );
    },

    info(titre, corps) {
        return (
            `┌─────────────────────────┐\n` +
            `│  ℹ️   ${titre.padEnd(19)}│\n` +
            `└─────────────────────────┘\n\n` +
            corps
        );
    },

    // ── Accès refusé ──────────────────────────
    accesDenied(raison = '') {
        return (
            `╔═══════════════════════════╗\n` +
            `║  🔐  ACCÈS NON AUTORISÉ   ║\n` +
            `╚═══════════════════════════╝\n\n` +
            `Tu n'as pas la permission d'utiliser le bot.\n\n` +
            (raison ? `_${raison}_\n\n` : '') +
            `Contacte un admin pour obtenir l'accès. 👆`
        );
    },

    // ── Commande inconnue ─────────────────────
    commandeInconnue(cmd, prefix) {
        return (
            `╔═══════════════════════════╗\n` +
            `║  ❓  COMMANDE INCONNUE    ║\n` +
            `╚═══════════════════════════╝\n\n` +
            `La commande *${prefix}${cmd}* n'existe pas.\n\n` +
            `Tape *${prefix}aide* pour voir toutes les commandes disponibles. 📋`
        );
    },

    // ── Erreur générique ──────────────────────
    erreurGenerique(cmd, msg) {
        return (
            `╔═══════════════════════════╗\n` +
            `║  ⚙️   ERREUR TECHNIQUE    ║\n` +
            `╚═══════════════════════════╝\n\n` +
            `Problème lors de l'exécution de *!${cmd}*.\n\n` +
            `> _${msg}_\n\n` +
            `Réessaie dans quelques instants. 🔄`
        );
    },

    // ── Champ info ────────────────────────────
    champ(label, valeur) {
        return `▸ *${label} :* ${valeur}`;
    },

    // ── Pied de page ──────────────────────────
    footer(texte) {
        return `${this.LINE}\n_${texte}_`;
    },

};

module.exports = D;
