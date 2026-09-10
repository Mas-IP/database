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
  // JUMLAH DATA
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
  // USER REGISTERED
  // ==========================================

  const registeredUsers = []

  for (const jid of Object.keys(users)) {

    const user = users[jid]

    if (!user) continue

    // HANYA USER YANG SUDAH REGISTER
    if (user.registered !== true) continue

    const normalizedJid = normalizeJid(jid)
    const number = getNumber(jid)

    if (!normalizedJid || !number) continue

    registeredUsers.push({
      jid: normalizedJid,
      number: number,
      money: Number(user.money) || 0
    })
  }

  // ==========================================
  // ANTI DOUBLE
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
  // URUTKAN MONEY TERBESAR
  // ==========================================

  uniqueUsers.sort((a, b) => b.money - a.money)

  // ==========================================
  // TOP MONEY
  // ==========================================

  const top = uniqueUsers.slice(0, len)

  if (!top.length) {
    return
  }

  let text = `💰 *Top ${top.length} Money*\n\n`

  for (let i = 0; i < top.length; i++) {

    const user = top[i]

    text += `${i + 1}. @${user.number} — *${user.money.toLocaleString('id-ID')} Money*\n`
  }

  // ==========================================
  // KIRIM
  // ==========================================

  await conn.reply(
    m.chat,
    text.trim(),
    m,
    {
      contextInfo: {
        mentionedJid: top.map(user => user.jid)
      }
    }
  )
}


// ==========================================
// HELP
// ==========================================

handler.help = ['topmoney']
handler.tags = ['rpg']

// ==========================================
// COMMAND
// ==========================================

handler.command = /^topmoney$/i

handler.group = true
handler.rpg = true

export default handler