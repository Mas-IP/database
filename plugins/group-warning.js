//create code Wonge-bot

const getMaxWarn = () => {
    const max = Number(global.maxwarn)
    return max > 0 ? max : 3
}

const ensureWarn = (user) => {
    if (typeof user.warn !== 'number' || !Number.isFinite(user.warn)) {
        user.warn = 0
    }

    if (user.warn < 0) {
        user.warn = 0
    }
}

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = async (m, { conn, text, usedPrefix, command, groupMetadata }) => {
    if (!m.isGroup) {
        return m.reply('Fitur ini hanya dapat digunakan dalam grup.')
    }

    let who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.quoted
            ? m.quoted.sender
            : false

    if (!who) {
        throw `✳️ Memberi label atau menyebut seseorang\n\n📌 Contoh: ${usedPrefix + command} @user`
    }

    if (!global.db.data.users[who]) {
        throw '✳️ Pengguna hilang dari database saya'
    }

    const user = global.db.data.users[who]
    const maxWarn = getMaxWarn()

    ensureWarn(user)

    const adminName = await conn.getName(m.sender)

    user.warn += 1

    // ==========================================
    // BELUM MENCAPAI BATAS
    // ==========================================

    if (user.warn < maxWarn) {
        await conn.sendMessage(m.chat, {
            text:
`⚠️ *PENGGUNA DIPERINGATKAN* ⚠️

▢ *Admin:* ${adminName}
▢ *Pengguna:* @${who.split('@')[0]}
▢ *Peringatan:* ${user.warn}/${maxWarn}
▢ *Alasan:* ${text || 'Tidak ada alasan'}`,
            mentions: [who]
        })

        return conn.sendMessage(m.chat, {
            text:
`⚠️ *PERINGATAN* ⚠️

@${who.split('@')[0]} menerima peringatan dari admin.

▢ *Peringatan:* ${user.warn}/${maxWarn}

Jika mencapai *${maxWarn}* peringatan, pengguna akan otomatis dikeluarkan dari grup.`,
            mentions: [who]
        })
    }

    // ==========================================
    // MENCAPAI BATAS → KICK
    // ==========================================

    user.warn = 0

    await conn.sendMessage(m.chat, {
        text:
`⛔ @${who.split('@')[0]} telah mencapai batas peringatan *${maxWarn}*.

Pengguna akan dikeluarkan dari grup.`,
        mentions: [who]
    })

    await delay(3000)

    try {
        await conn.groupParticipantsUpdate(
            m.chat,
            [who],
            'remove'
        )

        await conn.sendMessage(m.chat, {
            text:
`♻️ @${who.split('@')[0]} telah dikeluarkan dari grup *${groupMetadata.subject}* karena mencapai *${maxWarn}* peringatan.`,
            mentions: [who]
        })
    } catch (e) {
        // Kalau gagal kick, warn dikembalikan
        user.warn = maxWarn

        await conn.sendMessage(m.chat, {
            text:
`❌ Gagal mengeluarkan @${who.split('@')[0]} dari grup.

Peringatan tetap disimpan: *${user.warn}/${maxWarn}*`,
            mentions: [who]
        })
    }
}

handler.help = ['warn @user']
handler.tags = ['group']
handler.command = ['warn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler