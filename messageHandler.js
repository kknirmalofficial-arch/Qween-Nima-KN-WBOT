const axios = require('axios');

async function handleMessage(sock, mek) {
    const from = mek.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? mek.key.participant : from;
    
    // Type of text handle karanna (Simple text filter)
    const type = Object.keys(mek.message)[0];
    const body = (type === 'conversation') ? mek.message.conversation : 
                 (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : 
                 (type === 'imageMessage') ? mek.message.imageMessage.caption : 
                 (type === 'videoMessage') ? mek.message.videoMessage.caption : '';

    const prefix = /^[.📍‼️]/gi.test(body) ? body.match(/^[.📍‼️]/gi)[0] : '';
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(' ');

    if (!isCmd) return;

    // Helper Send Function for professional usage
    const reply = async (txt) => {
        await sock.sendMessage(from, { text: txt }, { quoted: mek });
    };

    // ================= COMMANDS MATRIX =================
    switch (command) {
        case 'menu':
        case 'help':
            const menuText = `✨ *QWEEN NIMA KN WBOT MENU* ✨\n\n` +
                             `🤖 *Bot Name:* Qween Nima KN WBOT\n` +
                             `⚙️ *Prefix:* [ ${prefix} ]\n\n` +
                             `*COMMANDS LIST:*\n` +
                             `📝 ${prefix}alive - Check if bot is running\n` +
                             `📝 ${prefix}ping - Check bot response speed\n` +
                             `📝 ${prefix}quote - Get an inspirational quote\n\n` +
                             `_Developed with ❤️ by kknirma_`;
            await reply(menuText);
            break;

        case 'alive':
            await reply('👋 Hey there! I am online and ready to serve you. 🚀');
            break;

        case 'ping':
            const start = new Date().getTime();
            // fake delay calculate karanna message yawwata passe
            const end = new Date().getTime();
            await reply(`⚡ Pong! Response Latency: *${end - start}ms*`);
            break;

        case 'quote':
            try {
                const res = await axios.get('https://api.quotable.io/random');
                const quote = `“${res.data.content}”\n\n- *${res.data.author}*`;
                await reply(quote);
            } catch {
                await reply('❌ Failed to fetch quote. Try again later.');
            }
            break;

        default:
            // command eka hadala nathnam reply karanne naha (or delete/ignore)
            break;
    }
}

module.exports = { handleMessage };
