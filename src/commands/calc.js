// ══════════════════════════════════════════
//   COMMANDE : !calc [expression]
// ══════════════════════════════════════════
module.exports = async function calcCmd(client, message, args) {
    const expression = args.join(' ');

    if (!expression) {
        return message.reply('🧮 Usage : *!calc [expression]*\n\nExemples :\n• _!calc 2 + 2_\n• _!calc 15 * 8_\n• _!calc sqrt(144)_\n• _!calc (100 / 4) * 3_');
    }

    // Nettoyer l'expression (accepter virgules comme points décimaux)
    const exprClean = expression
        .replace(/,/g, '.')
        .replace(/[×x]/g, '*')
        .replace(/÷/g, '/')
        .replace(/²/g, '**2')
        .replace(/³/g, '**3')
        .replace(/sqrt/gi, 'Math.sqrt')
        .replace(/pi/gi, 'Math.PI')
        .replace(/abs/gi, 'Math.abs')
        .replace(/floor/gi, 'Math.floor')
        .replace(/ceil/gi, 'Math.ceil')
        .replace(/round/gi, 'Math.round')
        .replace(/log/gi, 'Math.log10')
        .replace(/ln/gi, 'Math.log')
        .replace(/sin/gi, 'Math.sin')
        .replace(/cos/gi, 'Math.cos')
        .replace(/tan/gi, 'Math.tan');

    // Vérification sécurité : bloquer les injections
    const forbidden = /[a-zA-Z](?!ath\.|PI|sqrt|abs|floor|ceil|round|log|sin|cos|tan)/;
    const safeExpr = exprClean.replace(/Math\.\w+/g, '').replace(/[0-9\s\+\-\*\/\.\(\)\^]/g, '');
    if (safeExpr.length > 0) {
        return message.reply(`❌ Expression invalide ou non autorisée : *${expression}*`);
    }

    let resultat;
    try {
        // eslint-disable-next-line no-eval
        resultat = Function('"use strict"; return (' + exprClean + ')')();
    } catch {
        return message.reply(`❌ Impossible de calculer : *${expression}*\n\nVérifie la syntaxe de ton expression.`);
    }

    if (typeof resultat !== 'number' || !isFinite(resultat)) {
        return message.reply(`❌ Résultat invalide (division par zéro ou erreur).`);
    }

    // Formater le résultat
    const resultatFormate = Number.isInteger(resultat)
        ? resultat.toLocaleString('fr-FR')
        : resultat.toFixed(6).replace(/\.?0+$/, '');

    await message.reply(`🧮 *Calcul*\n\n📌 Expression : \`${expression}\`\n✅ Résultat : *${resultatFormate}*`);
};
