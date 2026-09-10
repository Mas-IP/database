//create code Wonge-bot

// plugins/premiumbot.js
// Promo premium bot

let handler = async (m, { conn, usedPrefix }) => {
  let txt = `✨ *PAKET PREMIUM 𝐖𝐎𝐍𝐆-𝐁𝟎𝐓* ✨

╭──「 💎 *ROLE PREMIUM* 」─⬣
│ 📅 1 Minggu  ⤑ Rp 3.000
│ 📅 2 Minggu  ⤑ Rp 5.000
│ 📅 1 Bulan   ⤑ Rp ~10.000~ *5000*
╰───────────────⬣

╭──「 🚀 *BENEFIT ROLE PREMIUM* 」─⬣
│ ✅ Unlimited Limit
│ ✅ Akses fitur AI
│ ✅ Auto naik role 
│ ✅ Auto Responder AI
╰───────────────⬣

💬 *Minat?*
Ketik: ${usedPrefix}owner

📢 *Info terbaru:*
https://chat.whatsapp.com/JS6l9Ru0Lls2rSmSGxBQ4E`

  let image = global.menushop

  // Cek apakah link gambar Telegra.ph tersedia
  if (image && typeof image === 'string' && image.trim() !== '') {
    try {
      // Kirim pesan beserta foto dari Telegra.ph
      await conn.sendMessage(
        m.chat,
        {
          image: { url: image },
          caption: txt,
          mentions: [m.sender]
        },
        { quoted: m }
      )
    } catch (err) {
      console.log('Error sending image from global.menushop, fallbacking to text:', err)
      // Fallback jika link error / gagal load gambar
      await conn.reply(m.chat, txt, m)
    }
  } else {
    // Fallback jika global.menushop kosong
    await conn.reply(m.chat, txt, m)
  }
}

handler.help = ['premiumbot']
handler.tags = ['shop']
handler.command = /^(premiumbot|belipremium|premium)$/i

export default handler