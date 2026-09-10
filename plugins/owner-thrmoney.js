//create code Wonge-bot

let handler = async (m, { conn, text, command, isOwner }) => {
  if (!m.isGroup) throw '❌ Hanya bisa dipakai di grup'

  global.db = global.db || {}
  global.db.data = global.db.data || {}
  global.db.data.chats = global.db.data.chats || {}
  global.db.data.users = global.db.data.users || {}

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  let chat = global.db.data.chats[m.chat]
  const EXPIRED = 7 * 24 * 60 * 60 * 1000 // 1 minggu

  // ================== BUAT THR ==================
  if (command === 'thr') {
    if (!isOwner) throw '❌ Khusus owner'

    let nominal = parseInt(text)
    if (!nominal || nominal < 1)
      throw 'Contoh:\n.thr 10000'

    chat.thr = {
      nominal,
      claimed: [],
      start: Date.now(),
      end: Date.now() + EXPIRED
    }

    return conn.reply(
      m.chat,
      `🎁 *THR DIBAGIKAN!* 🎁\n\n` +
      `💰 Nominal: *${nominal.toLocaleString()} money*\n` +
      `⏳ Berlaku: *7 hari*\n\n` +
      `Ketik *.ambil* untuk mengambil THR\n` +
      `Ketik *.thrcek* untuk lihat status`,
      m
    )
  }

  // ================== AMBIL ==================
  if (command === 'ambil') {
    if (!chat.thr) throw '❌ Tidak ada THR aktif'

    let thr = chat.thr

    if (Date.now() > thr.end) {
      delete chat.thr
      throw '⌛ THR sudah kadaluarsa'
    }

    if (thr.claimed.includes(m.sender))
      throw '❌ Kamu sudah ambil THR'

    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = { money: 0, exp: 0 }
    }
    
    global.db.data.users[m.sender].money = (global.db.data.users[m.sender].money || 0) + thr.nominal

    thr.claimed.push(m.sender)

    let totalClaim = thr.claimed.length
    let totalMoney = totalClaim * thr.nominal
    let sisa = thr.end - Date.now()

    let hari = Math.floor(sisa / (1000 * 60 * 60 * 24))
    let jam = Math.floor((sisa / (1000 * 60 * 60)) % 24)

    return conn.reply(
      m.chat,
      `🎉 *THR BERHASIL DIAMBIL!* 🎉\n\n` +
      `💰 Kamu dapat: *${thr.nominal.toLocaleString()} money*\n\n` +
      `📊 *STATISTIK THR*\n` +
      `👥 Total klaim: *${totalClaim} orang*\n` +
      `💸 Total uang keluar: *${totalMoney.toLocaleString()} money*\n` +
      `⏳ Sisa waktu: *${hari} hari ${jam} jam*`,
      m
    )
  }

  // ================== CEK STATUS ==================
  if (command === 'thrcek') {
    if (!chat.thr) throw '❌ Tidak ada THR aktif'

    let thr = chat.thr

    if (Date.now() > thr.end) {
      delete chat.thr
      throw '⌛ THR sudah kadaluarsa'
    }

    let totalClaim = thr.claimed.length
    let totalMoney = totalClaim * thr.nominal
    let sisa = thr.end - Date.now()

    let hari = Math.floor(sisa / (1000 * 60 * 60 * 24))
    let jam = Math.floor((sisa / (1000 * 60 * 60)) % 24)

    return conn.reply(
      m.chat,
      `📢 *STATUS THR AKTIF*\n\n` +
      `💰 Nominal: *${thr.nominal.toLocaleString()} money*\n` +
      `👥 Sudah klaim: *${totalClaim} orang*\n` +
      `💸 Total dibagikan: *${totalMoney.toLocaleString()} money*\n` +
      `⏳ Sisa waktu: *${hari} hari ${jam} jam*`,
      m
    )
  }
}

handler.help = ['thr <nominal>', 'ambil', 'thrcek']
handler.tags = ['rpg', 'owner']
handler.command = /^(thr|ambil|thrcek)$/i
handler.group = true

export default handler