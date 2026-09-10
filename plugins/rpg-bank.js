//create code Wonge-bot

let handler = async (m, { conn, usedPrefix, command }) => {

    // ==============================
    // PASTIKAN DATABASE TERSEDIA
    // ==============================
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}

    const users = global.db.data.users

    // ==============================
    // CEK PREMIUM
    // ==============================
    const isPremium = user => {
        if (!user) return false

        if (user.premium) return true

        if (
            typeof user.premiumTime === 'number' &&
            user.premiumTime > Date.now()
        ) {
            return true
        }

        return false
    }

    // ==============================
    // CEK APAKAH ADA TARGET
    // TAG / REPLY
    // ==============================
    const hasTarget =
        !!(
            (m.mentionedJid && m.mentionedJid[0]) ||
            (m.quoted && m.quoted.sender)
        )

    // ==============================
    // TARGET USER
    // TAG → REPLY → DIRI SENDIRI
    // ==============================
    const target =
        (m.mentionedJid && m.mentionedJid[0])
            ? m.mentionedJid[0]
            : (m.quoted && m.quoted.sender)
                ? m.quoted.sender
                : m.sender

    // ==============================
    // USER PEMINTA
    // ==============================
    if (!users[m.sender]) {
        users[m.sender] = {}
    }

    const senderUser = users[m.sender]

    // ==============================
    // CMD BANK
    // ==============================
    if (/^bank$/i.test(command)) {

        /*
         * BANK:
         *
         * Tanpa target:
         * semua user boleh cek bank sendiri.
         *
         * Dengan target:
         * hanya premium yang boleh.
         */
        if (hasTarget && !isPremium(senderUser)) {
            return conn.reply(
                m.chat,
`╭──「 🔒 PREMIUM ONLY 」
│ Fitur *bank @user* hanya
│ tersedia untuk pengguna Premium.
│
│ Kamu tetap bisa menggunakan:
│ • ${usedPrefix}bank
╰──────────────────`,
                m
            )
        }

        // ==============================
        // INISIALISASI TARGET
        // ==============================
        if (!users[target]) {
            users[target] = {}
        }

        const user = users[target]

        const name =
            user.name ||
            await conn.getName(target).catch(() => 'User')

        const money = Number.isFinite(user.money)
            ? user.money
            : 0

        const bank = Number.isFinite(user.bank)
            ? user.bank
            : 0

        return conn.reply(
            m.chat,
`╭──「 🏦 BANK USER 」
│ 👤 Nama : ${name}
│ 💰 Money : *${money.toLocaleString('id-ID')}*
│ 🏦 Bank : *${bank.toLocaleString('id-ID')}*
╰──────────────────

> *${usedPrefix}nabung <jumlah/all>*
> *${usedPrefix}tarik <jumlah/all>*`,
            m,
            {
                mentions: [target]
            }
        )
    }

    // ==============================
    // CMD MONEY
    // ==============================
    if (/^money$/i.test(command)) {

        /*
         * MONEY TIDAK MEMILIKI PEMBATASAN
         * PREMIUM.
         *
         * Semua user boleh:
         *
         * .money
         * .money @user
         * reply → .money
         */

        // ==============================
        // INISIALISASI TARGET
        // ==============================
        if (!users[target]) {
            users[target] = {}
        }

        const user = users[target]

        const name =
            user.name ||
            await conn.getName(target).catch(() => 'User')

        const money = Number.isFinite(user.money)
            ? user.money
            : 0

        return conn.reply(
            m.chat,
`╭──「 💰 MONEY USER 」
│ 👤 Nama : ${name}
│ 💵 Money : *${money.toLocaleString('id-ID')}*
╰──────────────────`,
            m,
            {
                mentions: [target]
            }
        )
    }
}

// ==============================
// HELP
// ==============================
handler.help = [
    'bank',
    'bank @user',
    'money',
    'money @user'
]

handler.tags = ['rpg']

// ==============================
// COMMAND
// ==============================
handler.command = /^(bank|money)$/i

handler.rpg = true

export default handler