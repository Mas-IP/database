//create code Wonge-bot

let handler = async (m, { conn, text, command }) => {
  if (!m.isGroup) throw '❌ Hanya bisa dipakai di grup'

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.users = global.db.data.users || {}

  let chat = global.db.data.chats[m.chat]

  if (!chat) {
    chat = {}
    global.db.data.chats[m.chat] = chat
  }

  // =========================
  // SIAPKAN DATABASE MONEYKAGET
  // =========================
  chat.moneykaget = chat.moneykaget || {}

  // =========================
  // BUAT MONEY KAGET
  // =========================
  if (command === 'moneykaget') {
    let total = Number(text.trim())

    if (!total || total < 1) {
      throw 'Contoh:\n.moneykaget 5000000'
    }

    if (!Number.isInteger(total)) {
      throw '❌ Jumlah money harus berupa angka bulat'
    }

    // =========================
    // USER PEMBUAT
    // =========================
    let user = global.db.data.users[m.sender]

    if (!user) {
      user = {
        money: 0,
        exp: 0
      }

      global.db.data.users[m.sender] = user
    }

    // =========================
    // CEK SALDO
    // =========================
    if (user.money < total) {
      throw (
        `❌ Money kamu tidak cukup\n\n` +
        `💰 Dibutuhkan: *${total.toLocaleString('id-ID')} money*\n` +
        `💳 Saldo kamu: *${user.money.toLocaleString('id-ID')} money*`
      )
    }

    // =========================
    // BUAT TOKEN UNIK
    // =========================
    let kode

    do {
      kode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
    } while (chat.moneykaget[kode])

    // =========================
    // POTONG MONEY PEMBUAT
    // =========================
    user.money -= total

    // =========================
    // SIMPAN EVENT
    // =========================
    chat.moneykaget[kode] = {
      owner: m.sender,
      total: total,
      originalTotal: total,
      kode: kode,
      claimed: [],
      end: Date.now() + 30 * 60 * 1000
    }

    return conn.reply(
      m.chat,
      `💥 *MONEY KAGET DIBUKA!* 💥\n\n` +
      `💰 Total: *${total.toLocaleString('id-ID')} money*\n` +
      `📊 Setiap claim: *10% dari sisa money*\n` +
      `⏳ Durasi: *30 menit*\n\n` +
      `🗝️ Kode:\n*${kode}*\n\n` +
      `Ketik:\n*.moneykagetclaim ${kode}*`,
      m
    )
  }

  // =========================
  // CLAIM MONEY KAGET
  // =========================
  if (command === 'moneykagetclaim') {
    let kode = text.trim().toUpperCase()

    if (!kode) {
      throw '❌ Masukkan kode money kaget'
    }

    let mk = chat.moneykaget[kode]

    if (!mk) {
      throw '❌ Kode money kaget tidak ditemukan atau sudah berakhir'
    }

    // =========================
    // WAKTU HABIS
    // =========================
    if (Date.now() >= mk.end) {
      let sisa = mk.total

      // Refund ke pembuat
      if (sisa > 0 && mk.owner) {
        let owner = global.db.data.users[mk.owner]

        if (!owner) {
          owner = {
            money: 0,
            exp: 0
          }

          global.db.data.users[mk.owner] = owner
        }

        owner.money += sisa
      }

      delete chat.moneykaget[kode]

      throw (
        `⌛ *Money kaget sudah berakhir!*\n\n` +
        `💰 Sisa: *${sisa.toLocaleString('id-ID')} money*\n` +
        `↩️ Sisa money dikembalikan ke pembuat`
      )
    }

    // =========================
    // CEK SUDAH CLAIM
    // =========================
    if (mk.claimed.includes(m.sender)) {
      throw '❌ Kamu sudah claim money kaget ini'
    }

    // =========================
    // CEK MONEY
    // =========================
    if (mk.total <= 0) {
      delete chat.moneykaget[kode]

      throw '🚫 Money kaget sudah habis'
    }

    // =========================
    // HITUNG REWARD
    // =========================
    let reward = Math.floor(mk.total * 0.10)

    // Kalau 10% kurang dari 1,
    // ambil seluruh sisa
    if (reward < 1) {
      reward = mk.total
    }

    // Pengaman
    if (reward > mk.total) {
      reward = mk.total
    }

    // =========================
    // USER CLAIM
    // =========================
    let user = global.db.data.users[m.sender]

    if (!user) {
      user = {
        money: 0,
        exp: 0
      }

      global.db.data.users[m.sender] = user
    }

    // =========================
    // BAGIKAN REWARD
    // =========================
    user.money += reward

    mk.total -= reward
    mk.claimed.push(m.sender)

    // =========================
    // RESPONSE
    // =========================
    conn.reply(
      m.chat,
      `🎉 *CLAIM BERHASIL!* 🎉\n\n` +
      `🗝️ Kode: *${kode}*\n` +
      `💰 Kamu dapat: *${reward.toLocaleString('id-ID')} money*\n` +
      `📊 Claim: *10% dari sisa money*\n` +
      `📉 Sisa money: *${mk.total.toLocaleString('id-ID')} money*`,
      m
    )

    // =========================
    // MONEY HABIS
    // =========================
    if (mk.total <= 0) {
      delete chat.moneykaget[kode]

      return conn.reply(
        m.chat,
        `💥 *MONEY KAGET HABIS!* 💥\n\n` +
        `🗝️ Kode: *${kode}*\n` +
        `🎉 Semua money berhasil diambil!`,
        m
      )
    }
  }
}

handler.help = [
  'moneykaget <total>',
  'moneykagetclaim <kode>'
]

handler.tags = ['rpg']

handler.command = /^(moneykaget|moneykagetclaim)$/i

handler.group = true

export default handler