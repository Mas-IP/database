//create code Wonge-bot

let handler = async (m, { conn }) => {
    const users = global.db.data.users

    let who

    if (m.isGroup) {
        who = m.mentionedJid && m.mentionedJid[0]
    } else {
        who = m.chat
    }

    if (!who) {
        return conn.reply(m.chat, 'Tag salah satu lah', m)
    }

    if (!users[who]) {
        return conn.reply(
            m.chat,
            'Pengguna tidak ada di database.',
            m
        )
    }

    if (!users[m.sender]) {
        return conn.reply(
            m.chat,
            'Data kamu tidak ditemukan di database.',
            m
        )
    }

    if (who === m.sender) {
        return conn.reply(
            m.chat,
            'Tidak bisa merampok diri sendiri.',
            m
        )
    }

    const now = Date.now()

    // Cooldown 5 jam
    const cooldown = 5 * 60 * 60 * 1000
    const lastRob = Number(users[m.sender].lastrob) || 0
    const remaining = cooldown - (now - lastRob)

    if (remaining > 0) {
        return conn.reply(
            m.chat,
            `Anda sudah merampok.\n` +
            `Tunggu *${clockString(remaining)}* lagi untuk merampok.`,
            m
        )
    }

    // Hanya mengambil money
    const targetMoney = Number(users[who].money) || 0

    if (targetMoney <= 0) {
        return conn.reply(
            m.chat,
            'Target tidak punya Money.',
            m
        )
    }

    // Rampokan tetap 1%.
    const persen = 1

    let dapat = Math.floor(
        targetMoney * persen / 100
    )

    // Minimal 1 Money jika target memiliki saldo
    if (dapat < 1) {
        dapat = 1
    }

    // Pengaman agar tidak mengambil lebih dari saldo target
    if (dapat > targetMoney) {
        dapat = targetMoney
    }

    // Kurangi money target
    users[who].money = targetMoney - dapat

    // Tambahkan money ke perampok
    users[m.sender].money =
        (Number(users[m.sender].money) || 0) + dapat

    // Set cooldown
    users[m.sender].lastrob = now

    return conn.reply(
        m.chat,
        `💰 *Berhasil Merampok!*\n\n` +
        `▢ Target: @${who.split('@')[0]}\n` +
        `▢ Persentase: *${persen}%*\n` +
        `▢ Mendapatkan: *${dapat} Money*\n\n` +
        `Cooldown: *5 jam*`,
        m,
        {
            mentions: [who]
        }
    )
}

handler.help = ['merampok *@user*']
handler.tags = ['rpg']
handler.command = /^merampok$/i
handler.limit = true
handler.group = true
handler.rpg = true

export default handler

function clockString(ms) {
    if (ms <= 0) return '00:00:00'

    const h = Math.floor(ms / 3600000)
    const m = Math.floor(ms / 60000) % 60
    const s = Math.floor(ms / 1000) % 60

    return [h, m, s]
        .map(v => String(v).padStart(2, '0'))
        .join(':')
}