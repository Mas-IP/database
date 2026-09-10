//create code Wonge-bot

const DEFAULT_FREE = 15

function isPremiumUser(user = {}) {
    if (user.premium) return true

    if (
        typeof user.premiumTime === 'number' &&
        user.premiumTime > Date.now()
    ) {
        return true
    }

    return false
}

let handler = async (m, { conn }) => {
    const users = global.db?.data?.users

    if (!users) {
        return conn.reply(m.chat, '❌ Database user tidak ditemukan.', m)
    }

    let totalReset = 0
    let totalPremium = 0

    for (const [user, data] of Object.entries(users)) {
        if (!data) continue

        // Premium tidak diubah
        if (isPremiumUser(data)) {
            totalPremium++
            continue
        }

        // Non-premium menjadi 15
        data.limit = DEFAULT_FREE
        totalReset++
    }

    return conn.reply(
        m.chat,
        `✅ *Limit berhasil direset!*\n\n` +
        `👤 Non-Premium: ${totalReset} user\n` +
        `💎 Premium: ${totalPremium} user\n` +
        `🎁 Limit Non-Premium: ${DEFAULT_FREE}`,
        m
    )
}

handler.help = ['resetlimit']
handler.tags = ['owner']
handler.command = /^(resetlimit|risetlimit)$/i

handler.owner = true

export default handler