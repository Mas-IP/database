//create code Wonge-bot

let handler = async (m, { conn, participants }) => {
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
    jid,
    limit: data.limit || 0
  }))

  // urut dari terkecil
  let sorted = users.sort((a, b) => a.limit - b.limit)

  // ambil max 30
  let top = sorted.slice(0, 30)

  // rank user sekarang (di semua data, bukan cuma 30)
  let rank = sorted.findIndex(u => u.jid === m.sender) + 1

  let text = `
• *TOP LIMIT 30 TERKECIL* •

Kamu: *${rank}* dari *${sorted.length}*

${top.map((u, i) => {
  let isInGroup = participants.some(p => p.id === u.jid)
  return `${i + 1}. ${
    isInGroup ? `(${conn.getName(u.jid)}) wa.me/` : '@'
  }${u.jid.split('@')[0]} *${u.limit} Limit*`
}).join('\n')}
`.trim()

  conn.reply(m.chat, text, m, {
    contextInfo: {
      mentionedJid: top
        .map(u => u.jid)
        .filter(jid => !participants.some(p => p.id === jid))
    }
  })
}

handler.help = ['toplimit0']
handler.tags = ['rpg']
handler.command = /^(toplimit0)$/i

handler.group = true
handler.admin = true
handler.rpg = true

export default handler