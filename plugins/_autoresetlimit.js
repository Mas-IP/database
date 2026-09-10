//create code Wonge-bot

const DEFAULT_FREE = 15
const ZONE = 'Asia/Jakarta'

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

function getToday() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date())
}

const handler = {
    before: async function all(m) {
        const db = global.db?.data

        if (!db) return
        if (!m?.sender) return

        const users = db.users || (db.users = {})
        const user = users[m.sender] || (users[m.sender] = {})

        // ==============================
        // TANGGAL HARI INI
        // ==============================
        const today = getToday()

        // ==============================
        // DEFAULT LIMIT USER BARU
        // ==============================
        if (
            typeof user.limit !== 'number' ||
            isNaN(user.limit)
        ) {
            user.limit = DEFAULT_FREE
        }

        // ==============================
        // RESET LIMIT HARIAN
        // ==============================
        if (user._limitDay !== today) {
            user._limitDay = today

            // ==============================
            // NON PREMIUM
            // RESET PAKSA MENJADI 15
            // ==============================
            if (!isPremiumUser(user)) {
                user.limit = DEFAULT_FREE
            }

            // ==============================
            // PREMIUM
            // LIMIT TIDAK DIUBAH
            // ==============================
        }

        // ==============================
        // SAFETY
        // ==============================
        if (user.limit < 0) {
            user.limit = 0
        }
    }
}

export default handler