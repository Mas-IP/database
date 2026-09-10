//create code Wonge-bot

// ==============================
// CONFIG
// ==============================

const PICKAXE_MAX_DURABILITY = 50
const PICKAXE_USE_DURABILITY = 10

// Cooldown 15 menit
const MINING_COOLDOWN = 15 * 60 * 1000

// Durasi proses nambang = 20 detik
const MINING_PROCESS_TIME = 20 * 1000

// ==============================
// RANDOM HASIL TAMBANG
// ==============================

function randomMiningResult() {

    const coal =
        Math.floor(Math.random() * 10)

    const emas =
        Math.floor(Math.random() * 51)

    const diamond =
        Math.floor(Math.random() * 10)

    const tiketcoin = 1

    return {
        coal,
        emas,
        diamond,
        tiketcoin
    }
}

// ==============================
// FORMAT WAKTU
// ==============================

function clockString(ms) {

    if (ms < 0) {
        ms = 0
    }

    const h =
        Math.floor(ms / 3600000)

    const m =
        Math.floor(ms / 60000) % 60

    const s =
        Math.floor(ms / 1000) % 60

    return [
        h,
        m,
        s
    ]
        .map(v =>
            v.toString().padStart(2, '0')
        )
        .join(':')
}

// ==============================
// DELAY
// ==============================

function delay(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

// ==============================
// EDIT PESAN
// ==============================

async function editMessage(
    conn,
    chat,
    key,
    text
) {

    try {

        if (!key) {
            return null
        }

        return await conn.sendMessage(
            chat,
            {
                text: text
            },
            {
                edit: key
            }
        )

    } catch (e) {

        console.log(
            '[NAMBANG EDIT ERROR]',
            e
        )

        return null
    }
}

// ==============================
// LOCK NAMBANG
// ==============================

global.nambangLocks =
    global.nambangLocks ||
    new Map()

// ==============================
// HANDLER
// ==============================

let handler = async (m, {
    conn,
    usedPrefix
}) => {

    const user =
        global.db?.data?.users?.[m.sender]

    if (!user) {

        throw (
            '❌ Data user tidak ditemukan di database.'
        )
    }

    const userId = m.sender

    // ==============================
    // CEK LOCK
    // ==============================

    if (
        global.nambangLocks.has(userId)
    ) {

        throw (
            '⏳ Kamu masih sedang dalam proses menambang.'
        )
    }

    // ==============================
    // DEFAULT DATA
    // ==============================

    if (
        typeof user.pickaxe !== 'number'
    ) {
        user.pickaxe = 0
    }

    if (
        typeof user.pickaxedurability !== 'number'
    ) {
        user.pickaxedurability = 0
    }

    if (
        typeof user.lastnambang !== 'number'
    ) {
        user.lastnambang = 0
    }

    if (
        typeof user.coal !== 'number'
    ) {
        user.coal = 0
    }

    if (
        typeof user.emas !== 'number'
    ) {
        user.emas = 0
    }

    if (
        typeof user.diamond !== 'number'
    ) {
        user.diamond = 0
    }

    if (
        typeof user.tiketcoin !== 'number'
    ) {
        user.tiketcoin = 0
    }

    // ==============================
    // NORMALISASI DURABILITY
    // ==============================

    if (
        user.pickaxedurability < 0
    ) {

        user.pickaxedurability = 0
    }

    if (
        user.pickaxedurability >
        PICKAXE_MAX_DURABILITY
    ) {

        user.pickaxedurability =
            PICKAXE_MAX_DURABILITY
    }

    // ==================================================
    // 1. DETEKSI PICKAXE
    // ==================================================

    if (user.pickaxe <= 0) {

        throw (
            `❌ *Kamu tidak memiliki Pickaxe.* ⛏️\n\n` +
            `Buat terlebih dahulu menggunakan:\n` +
            `*${usedPrefix}craft pickaxe*`
        )
    }

    // ==================================================
    // 2. DETEKSI DURABILITY
    // ==================================================

    if (
        user.pickaxedurability <
        PICKAXE_USE_DURABILITY
    ) {

        throw (
            `❌ *Durability Pickaxe tidak cukup!*\n\n` +
            `⛏️ Pickaxe : *Ada*\n` +
            `🛠️ Durability : *${user.pickaxedurability}/${PICKAXE_MAX_DURABILITY}*\n` +
            `⚒️ Dibutuhkan : *${PICKAXE_USE_DURABILITY} durability*\n\n` +
            `Gunakan *${usedPrefix}craft pickaxe* untuk menambah durability.`
        )
    }

    // ==================================================
    // 3. DETEKSI COOLDOWN
    // ==================================================

    const now =
        Date.now()

    const lastMining =
        Number(
            user.lastnambang || 0
        )

    const timeDiff =
        now - lastMining

    if (
        lastMining > 0 &&
        timeDiff < MINING_COOLDOWN
    ) {

        const remainingTime =
            MINING_COOLDOWN -
            timeDiff

        throw (
            `⏳ *Kamu masih kelelahan dari menambang!*\n\n` +
            `⛏️ Tunggu selama:\n` +
            `*${clockString(remainingTime)}*\n\n` +
            `⏰ Cooldown: *15 menit*`
        )
    }

    // ==============================
    // AKTIFKAN LOCK
    // ==============================

    global.nambangLocks.set(
        userId,
        now
    )

    try {

        // ==============================
        // DATA AWAL
        // ==============================

        const durabilityBefore =
            user.pickaxedurability

        const durabilityAfter =
            Math.max(
                0,
                durabilityBefore -
                PICKAXE_USE_DURABILITY
            )

        // ==============================
        // RANDOM HASIL
        // ==============================

        const hasil =
            randomMiningResult()

        // ==============================
        // PESAN AWAL
        // ==============================

        const sent =
            await conn.sendMessage(
                m.chat,
                {
                    text:
                        `╭━━〔 ⛏️ *NAMBANG* 〕━━╮
│
│ ⛏️ Mencari tempat tambang...
│
│ 🛠️ Pickaxe:
│    *${durabilityBefore}/${PICKAXE_MAX_DURABILITY}*
│
│ ⏳ Proses sedang dimulai...
│
╰━━━━━━━━━━━━━━━━━━╯`
                }
            )

        const messageKey =
            sent && sent.key
                ? sent.key
                : null

        // ==================================================
        // 5 DETIK
        // ==================================================

        await delay(5000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 ⛏️ *NAMBANG* 〕━━╮
│
│ 🔎 Mencari lebih dalam...
│
│ 🪨🪨🪨💎🪨🪨🪨
│ 🪨⛏️🪨🪨🪨🪨🪨
│ 🪨🪨🪙🪨💎🪨🪨
│
│ ⛏️ Mulai menambang...
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==================================================
        // 10 DETIK
        // TOTAL = 10 DETIK
        // ==================================================

        await delay(5000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 ⛏️ *NAMBANG* 〕━━╮
│
│ ⛏️ Kamu sedang berada
│    di dalam tambang...
│
│ 🪨🪨🪨🪨🪨🪨
│ 💎🪨⛏️🪨🪙🪨
│ 🪨🪨🪨⛏️🪨🪨
│
│ 🔎 Mencari mineral...
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==================================================
        // 15 DETIK
        // TOTAL = 15 DETIK
        // ==================================================

        await delay(5000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 ⛏️ *NAMBANG* 〕━━╮
│
│ 💥 *MINERAL TERDETEKSI!*
│
│ 💎 Diamond ditemukan!
│ 🪙 Emas ditemukan!
│ 🪨 Coal ditemukan!
│
│ ⛏️ Mengambil hasil tambang...
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==================================================
        // 20 DETIK
        // HASIL
        // ==================================================

        await delay(5000)

        // ==============================
        // SIMPAN HASIL
        // ==============================

        user.coal +=
            hasil.coal

        user.emas +=
            hasil.emas

        user.diamond +=
            hasil.diamond

        user.tiketcoin +=
            hasil.tiketcoin

        // ==============================
        // BARU SEKARANG DURABILITY
        // DIKURANGI
        // ==============================

        user.pickaxedurability =
            durabilityAfter

        // ==============================
        // PICKAXE HABIS
        // ==============================

        if (
            user.pickaxedurability <= 0
        ) {

            user.pickaxedurability = 0
            user.pickaxe = 0
        }

        // ==============================
        // COOLDOWN DIMULAI
        // ==============================

        user.lastnambang =
            Date.now()

        // ==============================
        // PESAN HASIL
        // ==============================

        let resultText =
            `╭━━〔 ⛏️ *HASIL NAMBANG* 〕━━╮
│
│ 🪨 Coal : *+${hasil.coal}*
│ ✨ Emas : *+${hasil.emas}*
│ 💎 Diamond : *+${hasil.diamond}*
│ 🎟️ Tiketcoin : *+${hasil.tiketcoin}*
│
├──────────────────
│
│ 🛠️ Pickaxe:
│    *${user.pickaxedurability}/${PICKAXE_MAX_DURABILITY}*
│
│ ⏰ Cooldown:
│    *15 Menit*
│
╰━━━━━━━━━━━━━━━━━━╯`

        // ==============================
        // PICKAXE HABIS
        // ==============================

        if (
            user.pickaxedurability <= 0
        ) {

            resultText +=
                `\n\n💥 *Pickaxe kamu habis!*` +
                `\n⚒️ Gunakan *${usedPrefix}craft pickaxe* untuk membeli durability lagi.`
        }

        // ==============================
        // EDIT HASIL
        // ==============================

        const edited =
            await editMessage(
                conn,
                m.chat,
                messageKey,
                resultText
            )

        // ==============================
        // FALLBACK
        // ==============================

        if (!edited) {

            await conn.reply(
                m.chat,
                resultText,
                m
            )
        }

    } catch (err) {

        console.log(
            '[NAMBANG ERROR]',
            err
        )

        // ==============================
        // PROSES GAGAL
        // ==============================
        //
        // Tidak membuat cooldown baru.
        // Tidak menganggap command berhasil.
        // Loader tidak akan memotong limit
        // jika handler melempar error.
        // ==============================

        throw err

    } finally {

        // ==============================
        // HAPUS LOCK
        // ==============================

        global.nambangLocks.delete(
            userId
        )
    }
}

// ==============================
// COMMAND
// ==============================

handler.help = [
    'nambang'
]

handler.tags = [
    'rpg'
]

handler.command =
    /^(nambang)$/i

handler.register = true
handler.group = true
handler.rpg = true

// ==============================
// LIMIT
// ==============================
//
// Limit ditangani oleh handler utama.
// Premium otomatis bebas limit.
//

handler.limit = true

handler.exp = 0
handler.money = 0
handler.fail = null

export default handler