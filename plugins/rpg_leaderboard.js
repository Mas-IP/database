//create code Wonge-bot

let handler = async (m, { conn, args }) => {

  // ==========================================
  // DATABASE
  // ==========================================

  const users = global.db?.data?.users || {}

  // ==========================================
  // NORMALISASI JID
  // ==========================================

  const normalizeJid = (jid) => {

    if (!jid) return ''

    return String(jid)
      .trim()
      .split(':')[0]
  }

  // ==========================================
  // AMBIL NOMOR
  // ==========================================

  const getNumber = (jid) => {

    const normalized = normalizeJid(jid)

    if (!normalized) return ''

    if (normalized.includes('@')) {
      return normalized.split('@')[0]
    }

    return normalized
  }

  // ==========================================
  // KONVERSI ANGKA
  // ==========================================

  const toNumber = (value) => {

    const number = Number(value)

    return Number.isFinite(number) ? number : 0
  }

  // ==========================================
  // JUMLAH USER
  // DEFAULT 10
  // MAX 50
  // ==========================================

  let len = 10

  if (args && args[0]) {

    const parsed = parseInt(args[0])

    if (!isNaN(parsed)) {
      len = Math.max(1, Math.min(parsed, 50))
    }
  }

  // ==========================================
  // AMBIL USER TERDAFTAR
  // ==========================================

  const registeredUsers = []

  for (const jid of Object.keys(users)) {

    const user = users[jid]

    if (!user) continue

    // HANYA USER REGISTERED
    if (user.registered !== true) continue

    const normalizedJid = normalizeJid(jid)
    const number = getNumber(jid)

    if (!normalizedJid || !number) continue

    registeredUsers.push({
      jid: normalizedJid,
      number: number,

      exp: toNumber(user.exp),
      limit: toNumber(user.limit),
      level: toNumber(user.level),
      money: toNumber(user.money),
      bank: toNumber(user.bank)
    })
  }

  // ==========================================
  // ANTI DOUBLE USER
  // ==========================================

  const uniqueUsers = []
  const seen = new Set()

  for (const user of registeredUsers) {

    if (seen.has(user.number)) {
      continue
    }

    seen.add(user.number)
    uniqueUsers.push(user)
  }

  // ==========================================
  // CEK USER
  // ==========================================

  if (!uniqueUsers.length) {
    return conn.reply(
      m.chat,
      'Belum ada user terdaftar.',
      m
    )
  }

  // ==========================================
  // SORTING
  // ==========================================

  const sortedExp = [...uniqueUsers]
    .sort((a, b) => b.exp - a.exp)

  const sortedLimit = [...uniqueUsers]
    .sort((a, b) => b.limit - a.limit)

  const sortedLevel = [...uniqueUsers]
    .sort((a, b) => b.level - a.level)

  const sortedMoney = [...uniqueUsers]
    .sort((a, b) => b.money - a.money)

  const sortedBank = [...uniqueUsers]
    .sort((a, b) => b.bank - a.bank)

  // ==========================================
  // BOARD CONFIG
  // ==========================================

  const boards = [
    ['XP', 'exp', 'Exp', sortedExp],
    ['Limit', 'limit', 'Limit', sortedLimit],
    ['Level', 'level', 'Level', sortedLevel],
    ['Money', 'money', 'Money', sortedMoney],
    ['Bank', 'bank', 'Bank', sortedBank]
  ]

  // ==========================================
  // RANK USER
  // ==========================================

  const rankOf = (sorted, number) => {

    const index = sorted.findIndex(
      user => user.number === number
    )

    return index === -1
      ? 0
      : index + 1
  }

  // ==========================================
  // USER PENGIRIM
  // ==========================================

  const senderJid = normalizeJid(m.sender)
  const senderNumber = getNumber(senderJid)

  // ==========================================
  // MENTION
  // ==========================================

  const mentionSet = new Set()

  // ==========================================
  // BUAT BOARD
  // ==========================================

  const boardText = async (
    title,
    property,
    label,
    sorted
  ) => {

    const top = sorted.slice(0, len)

    const lines = []

    for (let i = 0; i < top.length; i++) {

      const user = top[i]

      const jid = user.jid
      const number = user.number

      // JID VALID UNTUK MENTION
      const mentionJid =
        jid.includes('@')
          ? jid
          : `${number}@s.whatsapp.net`

      mentionSet.add(mentionJid)

      // Ambil nama dari WhatsApp
      let name = ''

      try {
        name = await conn.getName(mentionJid)
      } catch {
        name = ''
      }

      // Fallback kalau nama tidak tersedia
      if (!name || name === number) {
        name = `@${number}`
      }

      const value = user[property]

      lines.push(
        `${i + 1}. @${number} (${name}) *${value.toLocaleString('id-ID')} ${label}*`
      )
    }

    const rank = rankOf(sorted, senderNumber)

    return [
      `• *${title} Leaderboard Top ${top.length}* •`,
      `Kamu: *${rank || '-'}* dari *${sorted.length}*`,
      '',
      lines.join('\n')
    ].join('\n')
  }

  // ==========================================
  // BUAT SEMUA BOARD
  // ==========================================

  const sections = await Promise.all(

    boards.map(([title, property, label, sorted]) =>
      boardText(
        title,
        property,
        label,
        sorted
      )
    )

  )

  // ==========================================
  // HASIL
  // ==========================================

  const text = sections
    .join('\n\n')
    .trim()

  // ==========================================
  // KIRIM
  // ==========================================

  await conn.reply(
    m.chat,
    text,
    m,
    {
      contextInfo: {
        mentionedJid: [...mentionSet]
      }
    }
  )
}


// ==========================================
// HELP
// ==========================================

handler.help = ['leaderboard <jumlah user>']
handler.tags = ['info']

// ==========================================
// COMMAND
// ==========================================

handler.command = /^(leaderboard|lb)$/i

// ==========================================
// PERMISSION
// ==========================================

handler.owner = false
handler.mods = false
handler.premium = true
handler.group = true
handler.private = false

handler.admin = false
handler.botAdmin = false

// ==========================================
// RPG
// ==========================================

handler.rpg = true

// ==========================================
// LIMIT / EXP
// ==========================================

handler.fail = null
handler.exp = 0

export default handler