//create code Wonge-bot
// plugins/nenen.js

let handler = async function (m, { conn }) {
  // cek premium
  if (!global.db.data.users[m.sender].premium)
    throw 'Fitur ini khusus member premium.'

  // cek tag
  var target = m.mentionedJid && m.mentionedJid[0]
  if (!target)
    throw 'Tag orangnya.\nContoh: .nenen @user'

  var number = target.split('@')[0]

  var teks = 'NENEN NENEN KEPENGEN NENEN SAMA @' + number + '⁩. TETEK GEDE NAN KENCANG MILIK @' + number + ' MEMBUATKU KEPENGEN NENEN. DIBALUT PAKAIAN KETAT YANG ADUHAI CROOOOTOTOTOTOTOT ANJING SANGE GUA BANGSAT. @' + number + ', PLIS DENGERIN BAIK BAIK. TOLONG BUKA BAJU SEBENTAR SAJA PLISSS TOLOOONG BANGET, BIARKAN MULUT KERINGKU BISA MENGECAP NENEN @' + number + '⁩. BIARKAN AKU MENGENYOT NENENMU @' + number + '. AKU RELA NGASIH SESEMBAHAN APA AJA BERAPAPUN ITU DUIT YANG AKU BAKAR KHUSUS TERKHUSUS BUATMU. TAPI TOLOOOONG BANGET BUKA BAJUMU AKU MAU NENEN. NENEN NENEEEEN NENEN @' + number + '⁩ WANGIIII AAAKKHHKHHAH'

  conn.sendMessage(
    m.chat,
    {
      text: teks,
      mentions: [target]
    },
    {
      quoted: m
    }
  )
}

handler.help = ['nenen @tag']
handler.tags = ['rpg']
handler.command = /^nenen$/i
handler.level = 50
handler.premium = true

export default handler