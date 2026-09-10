//create code Wonge-bot

function normalizeJid(jid) {
    return jid ? jid.replace(/:\d+@/, '@') : jid
}

let handler = async (m, { conn }) => {
    let users = global.db.data.users

    let sender = normalizeJid(m.sender)

    if (!users[sender]) users[sender] = {}

    let user = users[sender]

    if (typeof user.pasangan === 'undefined')
        user.pasangan = null

    if (!user.pasangan)
        return m.reply('Kamu masih jomblo 😶')

    let pasangan = user.pasangan

    if (users[pasangan]) {
        users[pasangan].pasangan = null
    }

    user.pasangan = null

    await conn.sendMessage(m.chat, {
        text: `💔 Putus!

@${sender.split('@')[0]} ❌ @${pasangan.split('@')[0]}`,
        mentions: [sender, pasangan]
    })
}

handler.help = ['putus']
handler.tags = ['fun']
handler.command = /^putus$/i
handler.group = true

export default handler