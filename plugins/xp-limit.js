//create code Wonge-bot

let handler = async (m) => {
    // ==============================
    // TARGET USER
    // ==============================
    const who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.sender

    // ==============================
    // USER DATABASE
    // ==============================
    const users = global.db?.data?.users || {}
    const user = users[who] || {}

    // ==============================
    // LIMIT
    // ==============================
    const sisa = Number.isFinite(user.limit)
        ? user.limit
        : 0

    // ==============================
    // PREMIUM
    // ==============================
    const premium =
        user.premium ||
        (
            typeof user.premiumTime === 'number' &&
            user.premiumTime > Date.now()
        )

    // ==============================
    // INFO LIMIT
    // ==============================
    const text =
`╭──「 𝗟𝗜𝗠𝗜𝗧 𝗜𝗡𝗙𝗢 」
│
│ 🧍 User : @${who.split('@')[0]}
│ 💠 Limit tersisa : *${sisa}*
│ 🔄 Reset harian : *15 Limit*
│
│ ${
    premium
        ? '👑 *Premium User (Ⓟ)*\n│ Unlimited limit & full akses cmd.'
        : '💎 *Non-premium*\n│ Limit akan reset ke *15* setiap hari.\n│ Bisa upgrade ke premium (Cek *.premiumbot*)'
}
╰──────────────────────`

    return m.reply(text, null, {
        mentions: [who]
    })
}

handler.help = ['limit [@user]']
handler.tags = ['xp']
handler.command = /^limit$/i

export default handler