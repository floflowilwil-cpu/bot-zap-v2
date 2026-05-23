const fs   = require('fs');
const path = require('path');

// ══════════════════════════════════════════
//   SYSTÈME DE PERMISSIONS
//   Stockage dans un fichier JSON local
//   pour persister entre les redémarrages
// ══════════════════════════════════════════

const DB_PATH = path.join(__dirname, '../../data/permissions.json');

// S'assurer que le dossier data existe
function ensureDir() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Charger la base de permissions
function charger() {
    ensureDir();
    if (!fs.existsSync(DB_PATH)) return { admins: [], autorises: [] };
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch {
        return { admins: [], autorises: [] };
    }
}

// Sauvegarder la base de permissions
function sauvegarder(data) {
    ensureDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Vérifications ──────────────────────────────────────

/**
 * Vérifie si un userId est le super-admin (défini dans .env)
 */
function isSuperAdmin(userId) {
    const adminEnv = process.env.ADMIN_NUMBER;
    if (!adminEnv) return false;
    // Normaliser : retirer @c.us si présent
    const numero = userId.replace('@c.us', '').replace('@g.us', '');
    return numero === adminEnv || userId === `${adminEnv}@c.us`;
}

/**
 * Vérifie si un userId a la permission d'utiliser le bot
 * Super-admin → toujours autorisé
 * Admins ajoutés manuellement → autorisés
 * Utilisateurs dans la liste → autorisés
 */
function estAutorise(userId) {
    if (isSuperAdmin(userId)) return true;
    const db = charger();
    return db.admins.includes(userId) || db.autorises.includes(userId);
}

/**
 * Vérifie si un userId est admin du bot
 */
function estAdmin(userId) {
    if (isSuperAdmin(userId)) return true;
    const db = charger();
    return db.admins.includes(userId);
}

// ── Actions ───────────────────────────────────────────

/**
 * Ajoute un ou plusieurs utilisateurs à la liste autorisée
 * @param {string[]} userIds
 * @param {boolean} enAdmin - si true, les ajoute comme admins du bot
 */
function autoriser(userIds, enAdmin = false) {
    const db = charger();
    let ajoutes = [];

    for (const id of userIds) {
        if (enAdmin) {
            if (!db.admins.includes(id)) {
                db.admins.push(id);
                // Retirer de la liste simple si présent
                db.autorises = db.autorises.filter(u => u !== id);
                ajoutes.push(id);
            }
        } else {
            if (!db.autorises.includes(id) && !db.admins.includes(id)) {
                db.autorises.push(id);
                ajoutes.push(id);
            }
        }
    }

    sauvegarder(db);
    return ajoutes;
}

/**
 * Retire un ou plusieurs utilisateurs de toutes les listes
 */
function revoquer(userIds) {
    const db = charger();
    let retires = [];

    for (const id of userIds) {
        if (db.admins.includes(id) || db.autorises.includes(id)) {
            db.admins    = db.admins.filter(u => u !== id);
            db.autorises = db.autorises.filter(u => u !== id);
            retires.push(id);
        }
    }

    sauvegarder(db);
    return retires;
}

/**
 * Retourne la liste complète des utilisateurs autorisés
 */
function listerAutorises() {
    return charger();
}

module.exports = { estAutorise, estAdmin, isSuperAdmin, autoriser, revoquer, listerAutorises };
