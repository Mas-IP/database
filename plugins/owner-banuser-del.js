//create code Wonge-bot

// ==============================
// SETTING
// ==============================
// true  = detector aktif
// false = detector mati
const ENABLED = true

// ==============================
// BANNED MEMBER DETECTOR
// ==============================
let handler = async function (m) {
    try {
        // ==============================
        // ON / OFF
        // ==============================
        if (!ENABLED) {
            return
        }

        // ==============================
        // GROUP ONLY
        // ==============================
        if (!m) {
            return
        }

        if (!m.isGroup) {
            return
        }

        // ==============================
        // SENDER
        // ==============================
        if (!m.sender) {
            return
        }

        // Jangan hapus pesan bot sendiri
        if (m.fromMe) {
            return
        }

        // ==============================
        // DATABASE CHECK
        // ==============================
        if (
            !global.db ||
            !global.db.data ||
            !global.db.data.users
        ) {
            return
        }

        const user =
            global.db.data.users[
                m.sender
            ]

        if (!user) {
            return
        }

        // ==============================
        // CEK BANNED
        // ==============================
        if (
            user.banned !== true
        ) {
            return
        }

        // ==============================
        // MESSAGE KEY
        // ==============================
        if (
            !m.key ||
            !m.key.id
        ) {
            return
        }

        // ==============================
        // DELETE MESSAGE
        // ==============================
        await this.sendMessage(
            m.chat,
            {
                delete: {
                    remoteJid:
                        m.key.remoteJid ||
                        m.chat,

                    fromMe:
                        m.key.fromMe ||
                        false,

                    id:
                        m.key.id,

                    participant:
                        m.key.participant ||
                        m.sender
                }
            }
        )

    } catch {}
}

// ==============================
// AUTO DETECTOR
// ==============================
handler.all = handler

export default handler