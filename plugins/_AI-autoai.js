//create code Wonge-bot

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.sessionAI = conn.sessionAI || {}

    // ==============================
    // HARUS GRUP
    // ==============================
    if (!m.isGroup) {
        throw '❌ Fitur ini hanya bisa digunakan di grup.'
    }

    // ==============================
    // CEK COMMAND
    // ==============================
    if (!text) {
        throw `🚩 ${usedPrefix + command} *enable/disable*`
    }

    // ==============================
    // CEK ADMIN GRUP
    // ==============================
    let isAdmin = false

    try {
        const metadata = await conn.groupMetadata(m.chat)
        const participants = metadata?.participants || []

        const sender = String(m.sender || '').split(':')[0].replace('@s.whatsapp.net', '')

        const participant = participants.find(p => {
            const jid = String(p.id || '').split(':')[0].replace('@s.whatsapp.net', '')
            return jid === sender
        })

        if (
            participant &&
            (
                participant.admin === 'admin' ||
                participant.admin === 'superadmin'
            )
        ) {
            isAdmin = true
        }
    } catch (e) {
        console.error('[AUTOAI ADMIN CHECK]', e)
    }

    if (!isAdmin) {
        throw '❌ Hanya admin grup yang dapat mengaktifkan atau menonaktifkan AI.'
    }

    // ==============================
    // ACTION
    // ==============================
    const action = text.trim().toLowerCase()
    const sessionId = m.chat

    // ==============================
    // ENABLE
    // ==============================
    if (action === 'enable') {

        if (conn.sessionAI[sessionId]) {
            return m.reply(
                '⚠️ *WongeBot AI sudah aktif* di grup ini.'
            )
        }

        conn.sessionAI[sessionId] = {
            sessionChat: []
        }

        return m.reply(
            '✅ *WongeBot AI berhasil diaktifkan!*\n\n' +
            'Sekarang semua member grup dapat mengobrol dengan WongeBot.\n' +
            'Gunakan *.autoai disable* untuk mematikan AI.'
        )
    }

    // ==============================
    // DISABLE
    // ==============================
    if (action === 'disable') {

        if (!conn.sessionAI[sessionId]) {
            return m.reply(
                '⚠️ *WongeBot AI belum aktif* di grup ini.'
            )
        }

        delete conn.sessionAI[sessionId]

        return m.reply(
            '✅ *WongeBot AI berhasil dinonaktifkan!*\n\n' +
            'Session dan seluruh history percakapan telah dihapus.'
        )
    }

    throw `🚩 ${usedPrefix + command} *enable/disable*`
}

// ==============================
// AI BEFORE
// ==============================
handler.before = async (m, { conn }) => {

    conn.sessionAI = conn.sessionAI || {}

    // ==============================
    // ABAIKAN PESAN BOT SENDIRI
    // ==============================
    if (m.isZapo && m.fromMe) return

    // ==============================
    // HARUS GRUP
    // ==============================
    if (!m.isGroup) return

    // ==============================
    // HARUS ADA TEXT
    // ==============================
    if (!m.text) return

    // ==============================
    // SESSION BERDASARKAN GRUP
    // ==============================
    const sessionId = m.chat
    const session = conn.sessionAI[sessionId]

    if (!session) return

    // ==============================
    // ABAIKAN COMMAND
    // ==============================
    if (
        ['.', '#', '!', '/', '\\'].some(prefix =>
            m.text.startsWith(prefix)
        )
    ) {
        return
    }

    try {

        // ==============================
        // HISTORY
        // ==============================
        const previousMessages =
            session.sessionChat || []

        const messages = [
            {
                role: 'system',
                content: [
                    'Kamu adalah WongeBot, asisten AI yang dibuat oleh human.ygy.',
                    'Nama kamu adalah WongeBot.',
                    '',
                    'Kamu digunakan di dalam grup WhatsApp.',
                    'Kamu dapat diajak ngobrol oleh semua member grup.',
                    '',
                    'ATURAN:',
                    '- Jawab dengan bahasa Indonesia yang santai dan natural.',
                    '- Jawab langsung ke inti.',
                    '- Jangan bertele-tele.',
                    '- Jangan terlalu formal.',
                    '- Jangan mengulang pertanyaan pengguna.',
                    '- Jangan selalu mengakhiri jawaban dengan pertanyaan.',
                    '- Pahami konteks percakapan sebelumnya.',
                    '- Jika pengguna bercanda, balas dengan santai.',
                    '- Jika pengguna bertanya serius, jawab dengan jelas.',
                    '- Jika pengguna meminta bantuan coding, berikan solusi yang siap digunakan.',
                    '- Jangan mengaku sebagai manusia.',
                    '- Jika ditanya siapa pembuatmu, jawab: human.ygy.',
                    '- Jika ditanya nama kamu, jawab: WongeBot.'
                ].join('\n')
            },

            {
                role: 'assistant',
                content:
                    'Saya WongeBot, AI buatan human.ygy. Saya siap diajak ngobrol dan membantu.'
            },

            // ==============================
            // HISTORY
            // ==============================
            ...previousMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),

            // ==============================
            // PESAN BARU
            // ==============================
            {
                role: 'user',
                content: m.text
            }
        ]

        // ==============================
        // API BOTCahX
        // ==============================
        const params = {
            message: messages,
            apikey: btc
        }

        const { data } = await axios.post(
            'https://api.botcahx.eu.org/api/search/openai-custom-v2',
            params,
            {
                timeout: 60000
            }
        )

        console.log('[WONGEBOT AI]', data)

        // ==============================
        // CEK RESPONSE
        // ==============================
        if (!data || !data.result) {
            console.error(
                '[WONGEBOT AI ERROR RESPONSE]',
                data
            )

            return m.reply(
                '❌ WongeBot gagal mendapatkan jawaban AI.'
            )
        }

        const result = String(data.result).trim()

        if (!result) {
            return m.reply(
                '❌ WongeBot mendapatkan jawaban kosong.'
            )
        }

        // ==============================
        // KIRIM RESPONSE
        // ==============================
        await m.reply(result)

        // ==============================
        // SIMPAN HISTORY
        // ==============================
        session.sessionChat.push(
            {
                role: 'user',
                content: m.text
            },
            {
                role: 'assistant',
                content: result
            }
        )

        // ==============================
        // BATASI HISTORY
        // ==============================
        if (session.sessionChat.length > 20) {
            session.sessionChat =
                session.sessionChat.slice(-20)
        }

    } catch (e) {

        console.error(
            '[WONGEBOT AI ERROR]',
            e?.response?.data || e
        )

        return m.reply(
            '❌ Terjadi kesalahan saat menghubungi server AI.'
        )
    }
}

// ==============================
// CONFIG
// ==============================

handler.command = ['autoai']
handler.tags = ['ai']

handler.help = [
    'autoai enable',
    'autoai disable'
]

handler.limit = true

export default handler