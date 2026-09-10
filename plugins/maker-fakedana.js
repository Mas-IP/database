//create code Wonge-bot

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw `Masukkan nominal saldo yang diinginkan!\n\n*Contoh:*\n${usedPrefix + command} 5000000`;
    }

    if (!/^\d+$/.test(text.trim())) {
        throw `*❌ Format salah!*\n\nHanya masukkan angka tanpa titik, koma, atau simbol lainnya.\n\n*Contoh yang benar:*\n${usedPrefix + command} 5000000`;
    }

    try {
        await m.reply('⏳ _Sedang membuat gambar saldo DANA..._');

        let saldo = new Intl.NumberFormat('id-ID').format(Number(text.trim()));

        let apiUrl = `https://api.botcahx.eu.org/api/maker/canvas-fakeSaldoDana?apikey=${btc}&saldo=${encodeURIComponent(saldo)}`;

        await conn.sendFile(m.chat, apiUrl, 'fakedana.jpg', 'Done!', m);

    } catch (e) {
        m.reply('❌ Terjadi kesalahan saat memproses.');
    }
};  

handler.help = ['fakedana <nominal>'];
handler.tags = ['maker'];
handler.command = /^(fakedana)$/i;
handler.limit = true;
handler.group = true;

export default handler;