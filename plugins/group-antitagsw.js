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


// ==================================================
// COMMAND ANTITAGSW
// ==================================================

let handler = async (m, { conn, args, isAdmin, isOwner }) => {

    if (!m.isGroup) {
        return m.reply('Fitur ini hanya dapat digunakan dalam grup.')
    }

    if (!(isAdmin || isOwner)) {
        return m.reply('Maaf, fitur ini hanya dapat digunakan oleh admin grup.')
    }

    global.db.data.chats = global.db.data.chats || {}

    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = {}
    }

    if (!args[0]) {
        return m.reply('Silakan gunakan: .antitagsw *on/off*')
    }

    const option = args[0].toLowerCase()

    if (option === 'on') {

        if (global.db.data.chats[m.chat].antitagsw) {
            return m.reply(
                'Fitur Anti Tag Status WhatsApp sudah aktif di grup ini.'
            )
        }

        global.db.data.chats[m.chat].antitagsw = true

        return m.reply(
            '*Anti Tag Status WhatsApp* berhasil diaktifkan dalam grup ini.'
        )
    }

    if (option === 'off') {

        if (!global.db.data.chats[m.chat].antitagsw) {
            return m.reply(
                'Fitur Anti Tag Status WhatsApp sudah nonaktif di grup ini.'
            )
        }

        global.db.data.chats[m.chat].antitagsw = false

        return m.reply(
            '*Anti Tag Status WhatsApp* berhasil dinonaktifkan dalam grup ini.'
        )
    }

    return m.reply('Mohon pilih opsi yang valid: *on/off*')
}


// ==================================================
// ANTI TAG STATUS WHATSAPP
// ==================================================

handler.before = async (m, { conn, isBotAdmin, isAdmin, isOwner }) => {

    if (!m.isGroup) return

    global.db.data.chats = global.db.data.chats || {}

    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = {}
    }

    if (!global.db.data.chats[m.chat].antitagsw) {
        return
    }


    // ==================================================
    // DETEKSI TAG STATUS WHATSAPP
    // ==================================================

    const isTaggingInStatus = (
        m.mtype === 'groupStatusMentionMessage' ||
        (m.quoted && m.quoted.mtype === 'groupStatusMentionMessage') ||
        (m.message && m.message.groupStatusMentionMessage) ||
        (
            m.message &&
            m.message.protocolMessage &&
            m.message.protocolMessage.type === 25
        )
    )

    if (!isTaggingInStatus) return


    // ==================================================
    // ADMIN / OWNER
    // ==================================================
    // Tidak hapus pesan
    // Tidak tambah warn
    // Tidak kick
    // Hanya peringatan
    // ==================================================

    if (isAdmin || isOwner) {

        return conn.sendMessage(m.chat, {
            text:
`⚠️ *PERINGATAN ANTI TAG STATUS WHATSAPP*

@${m.sender.split('@')[0]}, grup ini terdeteksi ditandai dalam Status WhatsApp.

Mohon untuk tidak menandai grup dalam Status WhatsApp.

Hal tersebut tidak diperbolehkan dalam grup ini.`,
            mentions: [m.sender]
        })
    }


    // ==================================================
    // MEMBER BIASA
    // ==================================================

    // Pastikan database user tersedia
    global.db.data.users = global.db.data.users || {}

    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {}
    }

    const user = global.db.data.users[m.sender]

    ensureWarn(user)

    const maxWarn = getMaxWarn()


    // ==================================================
    // HAPUS PESAN MEMBER
    // ==================================================

    try {
        await conn.sendMessage(m.chat, {
            delete: m.key
        })
    } catch (e) {
        // Abaikan jika gagal menghapus
    }


    // ==================================================
    // CEK WARN SEBELUM MENAMBAH
    // ==================================================

    /*
        Contoh maxWarn = 3:

        warn 0 → pelanggaran → 1/3
        warn 1 → pelanggaran → 2/3
        warn 2 → pelanggaran → 3/3
        warn 3 → pelanggaran → KICK
    */

    if (user.warn < maxWarn) {

        user.warn += 1

        return conn.sendMessage(m.chat, {
            text:
`⚠️ *ANTI TAG STATUS WHATSAPP*

@${m.sender.split('@')[0]} terdeteksi menandai grup dalam Status WhatsApp.

▢ *Pelanggaran:* Tag Status WhatsApp
▢ *Peringatan:* ${user.warn}/${maxWarn}

Jangan mengulangi pelanggaran ini.
Jika melakukan pelanggaran lagi setelah mencapai *${maxWarn}* peringatan, kamu akan dikeluarkan dari grup.`,
            mentions: [m.sender]
        })
    }


    // ==================================================
    // WARN SUDAH MENCAPAI BATAS → KICK
    // ==================================================

    await conn.sendMessage(m.chat, {
        text:
`⛔ @${m.sender.split('@')[0]} telah melewati batas peringatan *${maxWarn}*.

Karena kembali melakukan pelanggaran, kamu akan dikeluarkan dari grup.`,
        mentions: [m.sender]
    })


    // ==================================================
    // BOT BUKAN ADMIN
    // ==================================================

    if (!isBotAdmin) {

        return conn.sendMessage(m.chat, {
            text:
`❌ Bot tidak memiliki izin admin untuk mengeluarkan @${m.sender.split('@')[0]}.

Peringatan tetap berada di *${user.warn}/${maxWarn}*.`,
            mentions: [m.sender]
        })
    }


    // ==================================================
    // KICK
    // ==================================================

    await delay(3000)

    try {

        await conn.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            'remove'
        )

        // Reset setelah berhasil kick
        user.warn = 0

        return conn.sendMessage(m.chat, {
            text:
`♻️ @${m.sender.split('@')[0]} telah dikeluarkan dari grup karena melewati batas *${maxWarn}* peringatan Anti Tag Status WhatsApp.`,
            mentions: [m.sender]
        })

    } catch (e) {

        // Kick gagal → warn tetap di batas
        user.warn = maxWarn

        return conn.sendMessage(m.chat, {
            text:
`❌ Gagal mengeluarkan @${m.sender.split('@')[0]} dari grup.

Peringatan tetap disimpan: *${user.warn}/${maxWarn}*.`,
            mentions: [m.sender]
        })
    }
}


// ==================================================
// HANDLER CONFIG
// ==================================================

handler.command = ['antitagsw']
handler.help = ['antitagsw'].map(a => a + ' *on/off*')
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler