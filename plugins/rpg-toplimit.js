//create code Wonge-bot

let handler = async (m, { conn, participants }) => {
  const users = global.db.data.users || {}
  const groupParticipants = Array.isArray(participants) ? participants : []

  // ==========================================
  // NORMALISASI JID
  // ==========================================
  const normalizeJid = (jid) => {
    if (!jid) return ''
    return String(jid).trim().split(':')[0]
  }

  // ==========================================
  // AMBIL NOMOR
  // ==========================================
  const getNumber = (jid) => {
    if (!jid) return ''

    const normalized = normalizeJid(jid)

    if (normalized.includes('@')) {
      return normalized.split('@')[0]
    }

    return normalized
  }

  // ==========================================
  // HANYA USER YANG SUDAH REGISTER
  // ==========================================
  const registeredUsers = []

  for (const jid in users) {
    const user = users[jid]

    if (!user) continue
    if (user.registered !== true) continue

    const normalizedJid = normalizeJid(jid)
    const number = getNumber(jid)

    if (!normalizedJid || !number) continue

    registeredUsers.push({
      jid: normalizedJid,
      number,
      limit: Number(user.limit) || 0
    })
  }

  // ==========================================
  // ANTI DOUBLE
  // ==========================================
  const uniqueUsers = []
  const seen = new Set()

  for (const user of registeredUsers) {
    if (seen.has(user.number)) continue

    seen.add(user.number)
    uniqueUsers.push(user)
  }

  // ==========================================
  // SORT LIMIT TERBESAR
  // ==========================================
  uniqueUsers.sort((a, b) => b.limit - a.limit)

  // ==========================================
  // TOP 30
  // ==========================================
  const top = uniqueUsers.slice(0, 30)

  // ==========================================
  // RANK USER
  // ==========================================
  const senderNumber = getNumber(m.sender)

  const rankIndex = uniqueUsers.findIndex(
    user => user.number === senderNumber
  )

  const rank = rankIndex === -1 ? '-' : rankIndex + 1

  // ==========================================
  // LIST
  // ==========================================
  const list = top.map((user, index) => {
    return `${index + 1}. @${user.number} *${user.limit} Limit*`
  })

  // ==========================================
  // TEXT
  // ==========================================
  const text = `
• *TOP LIMIT 30 MEMBER TERATAS* •

Kamu: *${rank}* dari *${uniqueUsers.length}* user terdaftar

${list.length ? list.join('\n') : 'Belum ada user yang terdaftar.'}
`.trim()

  // ==========================================
  // MENTION
  // ==========================================
  const mentionedJid = top.map(user => user.jid)

  await conn.reply(m.chat, text, m, {
    contextInfo: {
      mentionedJid
    }
  })
}

handler.help = ['toplimit']
handler.tags = ['rpg']
handler.command = /^(toplimit)$/i

handler.group = true
handler.admin = true
handler.rpg = true

export default handler