//create code Wonge-bot

function normalizeJid(jid) {
    return jid ? jid.replace(/:\d+@/, '@') : jid
}

let handler = async (m, { conn }) => {
    let users = global.db.data.users

    let sender = normalizeJid(m.sender)
    let target = m.mentionedJid && m.mentionedJid[0]

    if (!target) return m.reply('Tag orangnya 😶')

    target = normalizeJid(target)

    if (!users[sender]) users[sender] = {}

    let user = users[sender]

    if (typeof user.ditembakOleh === 'undefined')
        user.ditembakOleh = null

    if (typeof user.tembakTimeout === 'undefined')
        user.tembakTimeout = null

    if (user.ditembakOleh !== target)
        return m.reply('Dia tidak sedang menembak kamu')

    if (user.tembakTimeout) {
        clearTimeout(user.tembakTimeout)
        user.tembakTimeout = null
    }

    user.ditembakOleh = null

    await conn.sendMessage(m.chat, {
        text: `💔 @${target.split('@')[0]} ditolak 😔`,
        mentions: [target]
    })
}

handler.help = ['tolak @user']
handler.tags = ['fun']
handler.command = /^tolak$/i
handler.group = true

export default handler