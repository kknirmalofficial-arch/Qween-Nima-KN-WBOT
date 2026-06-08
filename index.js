const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const { handleMessage } = require('./messageHandler');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const logger = pino({ level: 'silent' });
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // QR eka text terminal eke format karala ganna nisa false karන්න
        logger
    });

    // Connection Updates Management
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.clear();
            console.log('--- SCAN THIS QR CODE TO CONNECT ---');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔴 Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.clear();
            console.log('==============================================');
            console.log('👑 QWEEN NIMA KN WBOT IS ONLINE SUCCESSFULLY 👑');
            console.log('==============================================');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Incoming Messages Management
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return; // Status views ignore karanna

            await handleMessage(sock, mek);
        } catch (err) {
            console.error('Error handling message update: ', err);
        }
    });
}

connectToWhatsApp();
