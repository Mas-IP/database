//create code Wonge-bot

function normalizeJid(jid) {
    return jid ? jid.replace(/:\d+@/, '@') : jid
}

const TEMBAK_TIMEOUT = 3 * 60 * 1000

let handler = async (m, { conn }) => {
    let users = global.db.data.users

    let sender = normalizeJid(m.sender)
    let target = m.mentionedJid && m.mentionedJid[0]

    if (!target) return m.reply('Tag orang yang mau kamu tembak 😳')

    target = normalizeJid(target)

    if (sender === target)
        return m.reply('Tidak bisa nembak diri sendiri 😭')

    if (!users[sender]) users[sender] = {}
    if (!users[target]) users[target] = {}

    let user = users[sender]
    let targetUser = users[target]

    if (typeof user.pasangan === 'undefined')
        user.pasangan = null

    if (typeof targetUser.pasangan === 'undefined')
        targetUser.pasangan = null

    if (typeof user.ditembakOleh === 'undefined')
        user.ditembakOleh = null

    if (typeof targetUser.ditembakOleh === 'undefined')
        targetUser.ditembakOleh = null

    if (typeof user.tembakTimeout === 'undefined')
        user.tembakTimeout = null

    if (typeof targetUser.tembakTimeout === 'undefined')
        targetUser.tembakTimeout = null

    if (user.pasangan)
        return m.reply('Kamu sudah punya pasangan 😔')

    if (targetUser.pasangan)
        return m.reply('Dia sudah punya pasangan 😭')

    if (targetUser.ditembakOleh)
        return m.reply('Dia sedang ditembak orang lain 😳')

    targetUser.ditembakOleh = sender

    targetUser.tembakTimeout = setTimeout(() => {
        if (
            users[target] &&
            users[target].ditembakOleh === sender
        ) {
            users[target].ditembakOleh = null
            users[target].tembakTimeout = null

            conn.sendMessage(m.chat, {
                text: `⏰ Waktu habis!\n\n@${target.split('@')[0]} tidak merespon tembakan dari @${sender.split('@')[0]}`,
                mentions: [sender, target]
            })
        }
    }, TEMBAK_TIMEOUT)

    await conn.sendMessage(m.chat, {
        text: `💌 @${target.split('@')[0]}

Kamu ditembak oleh @${sender.split('@')[0]}

❤️ *.terima @${sender.split('@')[0]}*
💔 *.tolak @${sender.split('@')[0]}*`,
        mentions: [sender, target]
    })
}

handler.help = ['tembak @user']
handler.tags = ['fun']
handler.command = /^tembak$/i
handler.group = true
handler.premium = false


export default handler