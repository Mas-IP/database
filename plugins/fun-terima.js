//create code Wonge-bot

function normalizeJid(jid) {
    return jid ? jid.replace(/:\d+@/, '@') : jid
}

let handler = async (m, { conn }) => {
    let users = global.db.data.users

    let sender = normalizeJid(m.sender)
    let target = m.mentionedJid && m.mentionedJid[0]

    if (!target) return m.reply('Tag orangnya 😳')

    target = normalizeJid(target)

    if (!users[sender]) users[sender] = {}
    if (!users[target]) users[target] = {}

    let user = users[sender]
    let targetUser = users[target]

    if (typeof user.ditembakOleh === 'undefined')
        user.ditembakOleh = null

    if (typeof user.tembakTimeout === 'undefined')
        user.tembakTimeout = null

    if (typeof user.pasangan === 'undefined')
        user.pasangan = null

    if (typeof targetUser.pasangan === 'undefined')
        targetUser.pasangan = null

    if (user.ditembakOleh !== target)
        return m.reply('Dia tidak sedang menembak kamu 🤨')

    if (user.tembakTimeout) {
        clearTimeout(user.tembakTimeout)
        user.tembakTimeout = null
    }

    user.pasangan = target
    targetUser.pasangan = sender
    user.ditembakOleh = null

    await conn.sendMessage(m.chat, {
        text: `💖 Jadian!

@${sender.split('@')[0]} ❤️ @${target.split('@')[0]}`,
        mentions: [sender, target]
    })
}

handler.help = ['terima @user']
handler.tags = ['fun']
handler.command = /^terima$/i
handler.group = true

export default handler