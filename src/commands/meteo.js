const axios = require('axios');

// ══════════════════════════════════════════
//   COMMANDE : !meteo [ville]
// ══════════════════════════════════════════
module.exports = async function meteoCmd(client, message, args) {
    const ville = args.join(' ') || process.env.DEFAULT_CITY || 'Yaoundé';
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey || apiKey === 'ta_cle_meteo_ici') {
        return message.reply('⚠️ Clé API météo non configurée. Ajoute OPENWEATHER_API_KEY dans le fichier .env');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ville)}&appid=${apiKey}&units=metric&lang=fr`;
    const data = (await axios.get(url)).data;

    const desc    = data.weather[0].description;
    const temp    = Math.round(data.main.temp);
    const ressenti = Math.round(data.main.feels_like);
    const humidite = data.main.humidity;
    const vent    = Math.round(data.wind.speed * 3.6); // m/s → km/h

    // Choisir un emoji selon la météo
    const weatherEmoji = getWeatherEmoji(data.weather[0].id);

    const reponse = `
${weatherEmoji} *Météo à ${data.name}, ${data.sys.country}*

🌡️ Température : *${temp}°C* (ressenti ${ressenti}°C)
🌬️ Vent : *${vent} km/h*
💧 Humidité : *${humidite}%*
📋 Conditions : _${desc}_
    `.trim();

    await message.reply(reponse);
};

function getWeatherEmoji(code) {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌦️';
    if (code >= 500 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code > 800) return '⛅';
    return '🌤️';
}
