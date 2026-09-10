//create code Wonge-bot

// plugins/sewabot.js
// Promo sewa bot

let handler = async (m, { conn, usedPrefix }) => {
  let txt = `✨ *PAKET SEWA 𝐖𝐎𝐍𝐆-𝐁𝟎𝐓* ✨

╭──「 💰 *PAKET SEWA* 」─⬣
│ *NOTE : 1 TRANSAKSI UNTUK 1 GRUP*
│ 📅 Beta 1 Minggu + prem 3h ⤑ Rp 5.000
│ 📅 2 Minggu               ⤑ Rp 10.000
│ 📅 1 Bulan                ⤑ Rp 15.000
│ 📅 1 Bulan + Premium      ⤑ Rp 20.000
╰───────────────⬣

╭──「 🚀 *FITUR UTAMA* 」─⬣
│ ✅ Downloader All Sosmed
│ ✅ Anti Link & Anti Tag SW
│ ✅ Auto Welcome/Bye
│ ✅ Tools Admin Lengkap
│ ✅ Auto Responder AI
│ ✅ Support 24/7 Active
╰───────────────⬣

╭──「 🔒 *SISTEM AMAN* 」─⬣
│ 🛡️ Bot menggunakan nomor kami
│ 🛡️ Nomor Anda tidak digunakan
│ 🛡️ Risiko pada nomor bot
│
│ 💡 Cara Kerja:
│ 1. Sewa bot
│ 2. Bot diundang ke grup
│ 3. Bot aktif otomatis
╰───────────────⬣

💬 *Minat?*
Ketik: ${usedPrefix}owner

📢 *Info terbaru:*
https://chat.whatsapp.com/JS6l9Ru0Lls2rSmSGxBQ4E`

  let image = global.menushop

  // Cek apakah link gambar Telegra.ph tersedia di config
  if (image && typeof image === 'string' && image.trim() !== '') {
    try {
      // Menggunakan conn.sendFile (Lebih stabil untuk load URL gambar di Baileys)
      await conn.sendFile(m.chat, image, 'sewa.jpg', txt, m, false, { mentions: [m.sender] })
    } catch (err) {
      console.log('Error fetch gambar telegra.ph, fallback ke teks:', err)
      // Fallback jika link error / bot gagal unduh gambar
      await m.reply(txt)
    }
  } else {
    // Fallback jika global.menushop kosong
    await m.reply(txt)
  }
}

handler.help = ['sewabot']
handler.tags = ['shop']
handler.command = /^(sewa|sewabot|rentbot)$/i

export default handler