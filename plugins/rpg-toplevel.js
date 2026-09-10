//create code Wonge-bot

let handler = async (m, { conn, args, participants }) => {
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
    jid,
    level: data.level || 0
  }))

  let sorted = users.sort((a, b) => b.level - a.level)

  let len = args[0] ? Math.min(parseInt(args[0]), 50) : 10
  if (isNaN(len)) len = 10

  let text = `🏆 *Top ${len} Level*\n\n`

  for (let i = 0; i < len && i < sorted.length; i++) {
    let { jid, level } = sorted[i]

    let name = participants.find(p => p.jid === jid)
      ? `(${conn.getName(jid)}) wa.me/`
      : '@'

    text += `${i + 1}. ${name}${jid.split('@')[0]} — *Level ${level}*\n`
  }

  conn.reply(m.chat, text.trim(), m, {
    contextInfo: {
      mentionedJid: sorted.slice(0, len).map(v => v.jid)
    }
  })
}

handler.help = ['toplevel']
handler.tags = ['rpg']
handler.command = /^(toplevel)$/i
handler.group = true
handler.rpg = true

export default handler