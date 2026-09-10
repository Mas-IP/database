//create code Wonge-bot

// ==============================
// SISTEM RARITY MANCING
// ==============================

const FISH_TABLE = [
    // ==============================
    // COMMON
    // ==============================
    {
        id: 'ikan',
        name: 'Ikan',
        emoji: '🐟',
        min: 1,
        max: 25,
        weight: 300
    },
    {
        id: 'udang',
        name: 'Udang',
        emoji: '🦐',
        min: 1,
        max: 20,
        weight: 250
    },
    {
        id: 'kepiting',
        name: 'Kepiting',
        emoji: '🦀',
        min: 1,
        max: 15,
        weight: 180
    },

    // ==============================
    // UNCOMMON
    // ==============================
    {
        id: 'cumi',
        name: 'Cumi',
        emoji: '🦑',
        min: 1,
        max: 10,
        weight: 120
    },
    {
        id: 'dory',
        name: 'Ikan Dory',
        emoji: '🐠',
        min: 1,
        max: 8,
        weight: 90
    },

    // ==============================
    // RARE
    // ==============================
    {
        id: 'buntal',
        name: 'Ikan Buntal',
        emoji: '🐡',
        min: 1,
        max: 5,
        weight: 60
    },
    {
        id: 'lobster',
        name: 'Lobster',
        emoji: '🦞',
        min: 1,
        max: 4,
        weight: 40
    },

    // ==============================
    // EPIC
    // ==============================
    {
        id: 'gurita',
        name: 'Gurita',
        emoji: '🐙',
        min: 1,
        max: 3,
        weight: 25
    },
    {
        id: 'lumba',
        name: 'Lumba Lumba',
        emoji: '🐬',
        min: 1,
        max: 2,
        weight: 15
    },
    {
        id: 'hiu',
        name: 'Hiu',
        emoji: '🦈',
        min: 1,
        max: 2,
        weight: 10
    },

    // ==============================
    // LEGENDARY
    // ==============================
    {
        id: 'paus',
        name: 'Paus',
        emoji: '🐋',
        min: 1,
        max: 1,
        weight: 5
    },
    {
        id: 'orca',
        name: 'Paus Orca',
        emoji: '🐳',
        min: 1,
        max: 1,
        weight: 2
    }
]

// ==============================
// RARITY
// ==============================

const RARITY = {
    ikan: 'Common',
    udang: 'Common',
    kepiting: 'Common',

    cumi: 'Uncommon',
    dory: 'Uncommon',

    buntal: 'Rare',
    lobster: 'Rare',

    gurita: 'Epic',
    lumba: 'Epic',
    hiu: 'Epic',

    paus: 'Legendary',
    orca: 'Legendary'
}

// ==============================
// CONFIG MANCING
// ==============================

// Durability yang digunakan setiap kali mancing
const FISHING_DURABILITY_USE = 10

// Durability maksimal
const FISHING_MAX_DURABILITY = 50

// Cooldown command = 10 menit
const FISHING_COOLDOWN = 10 * 60 * 1000

// Total proses mancing = 28 detik
const FISHING_PROCESS_TIME = 28 * 1000

// ==============================
// LOCK MANCING
// ==============================

global.mancingLocks = global.mancingLocks || new Map()

// ==============================
// RANDOM IKAN
// ==============================

function randomFish() {
    let totalWeight = 0

    for (const fish of FISH_TABLE) {
        totalWeight += fish.weight
    }

    let random = Math.random() * totalWeight

    for (const fish of FISH_TABLE) {
        random -= fish.weight

        if (random <= 0) {
            return fish
        }
    }

    return FISH_TABLE[0]
}

// ==============================
// RANDOM JUMLAH
// ==============================

function randomAmount(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min
}

// ==============================
// FORMAT WAKTU
// ==============================

function formatTime(ms) {
    if (ms < 0) {
        ms = 0
    }

    let seconds = Math.floor(ms / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)

    seconds %= 60
    minutes %= 60
    hours %= 24

    const hStr = String(hours).padStart(2, '0')
    const mStr = String(minutes).padStart(2, '0')
    const sStr = String(seconds).padStart(2, '0')

    return `${hStr}:${mStr}:${sStr}`
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

async function editMessage(conn, chat, key, text) {
    if (!key) {
        return null
    }

    try {
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
            '[MANCING EDIT ERROR]',
            e
        )

        return null
    }
}

// ==============================
// HANDLER
// ==============================

let handler = async (m, { conn }) => {
    const user =
        global.db?.data?.users?.[m.sender]

    if (!user) {
        throw '❌ Data pengguna tidak ditemukan di database.'
    }

    const userId = m.sender

    // ==============================
    // CEK LOCK PROSES
    // ==============================

    if (global.mancingLocks.has(userId)) {
        throw '⏳ Kamu masih sedang dalam proses mancing.'
    }

    // ==============================
    // DATABASE DEFAULT
    // ==============================

    if (typeof user.fishingrod !== 'number') {
        user.fishingrod = 0
    }

    if (typeof user.fishingroddurability !== 'number') {
        user.fishingroddurability = 0
    }

    if (typeof user.lastmancing !== 'number') {
        user.lastmancing = 0
    }

    // ==============================
    // NORMALISASI DURABILITY
    // ==============================

    if (user.fishingroddurability < 0) {
        user.fishingroddurability = 0
    }

    if (
        user.fishingroddurability >
        FISHING_MAX_DURABILITY
    ) {
        user.fishingroddurability =
            FISHING_MAX_DURABILITY
    }

    // ==============================
    // 1. CEK PANCING
    // ==============================

    if (user.fishingrod <= 0) {
        throw (
            `❌ *Kamu tidak memiliki Fishingrod.*\n\n` +
            `🎣 Buat terlebih dahulu dengan:\n` +
            `*craft fishingrod*`
        )
    }

    // ==============================
    // 2. CEK DURABILITY
    // ==============================

    if (
        user.fishingroddurability <
        FISHING_DURABILITY_USE
    ) {
        throw (
            `❌ *Durability Fishingrod tidak cukup!*\n\n` +
            `🎣 Fishingrod : *Ada*\n` +
            `🛠️ Durability : *${user.fishingroddurability}/${FISHING_MAX_DURABILITY}*\n` +
            `⚒️ Dibutuhkan : *${FISHING_DURABILITY_USE} durability*\n\n` +
            `Gunakan *craft fishingrod* untuk menambah durability.`
        )
    }

    // ==============================
    // 3. CEK COOLDOWN
    // ==============================

    const now = Date.now()

    const lastFishingTime =
        Number(user.lastmancing || 0)

    const timeDiff =
        now - lastFishingTime

    if (
        lastFishingTime > 0 &&
        timeDiff < FISHING_COOLDOWN
    ) {
        const remainingTime =
            FISHING_COOLDOWN - timeDiff

        throw (
            `⏳ *Kamu baru saja mancing!*\n\n` +
            `🎣 Tunggu selama:\n` +
            `*${formatTime(remainingTime)}*\n\n` +
            `⏰ Cooldown: *10 menit*`
        )
    }

    // ==============================
    // AKTIFKAN LOCK
    // ==============================

    global.mancingLocks.set(
        userId,
        now
    )

    try {
        // ==============================
        // SIMPAN DATA SEBELUM PROSES
        // ==============================

        const durabilityBefore =
            user.fishingroddurability

        const durabilityAfter =
            Math.max(
                0,
                durabilityBefore -
                FISHING_DURABILITY_USE
            )

        // ==============================
        // SET COOLDOWN
        // ==============================

        // Cooldown mulai ketika command
        // berhasil melewati seluruh validasi.
        user.lastmancing = now

        // ==============================
        // PESAN AWAL
        // ==============================

        const sent =
            await conn.sendMessage(
                m.chat,
                {
                    text:
                        `╭━━〔 🎣 *MANCING* 〕━━╮
│
│ 🎣 Kamu mulai pergi mancing...
│
│ 🛠️ Durability:
│    *${durabilityBefore} → ${durabilityAfter}/50*
│
│ ⏳ Menunggu ikan memakan
│    umpan...
│
╰━━━━━━━━━━━━━━━━━━╯`
                }
            )

        const messageKey =
            sent && sent.key
                ? sent.key
                : null

        // ==============================
        // TUNGGU 8 DETIK
        // ==============================

        await delay(8000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 🎣 *MANCING* 〕━━╮
│
│ 🎣 Pancing sudah dilempar.
│
│ ⏳ Tunggu...
│
│ 🪱 Umpan sedang berada
│    di dalam air.
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==============================
        // TUNGGU 10 DETIK
        // TOTAL = 18 DETIK
        // ==============================

        await delay(10000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 🎣 *MANCING* 〕━━╮
│
│ ❗ *UMPAN DIMAKAN IKAN!*
│
│ 🎣 Cepat tarik pancingnya!
│
│ 💥 Ada sesuatu yang
│    menarik umpanmu...
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==============================
        // TUNGGU 10 DETIK
        // TOTAL = 28 DETIK
        // ==============================

        await delay(10000)

        // ==============================
        // RANDOM TANGKAPAN
        // ==============================

        const caught = {}

        const numberOfTypes =
            Math.floor(
                Math.random() * 5
            ) + 3

        for (
            let i = 0;
            i < numberOfTypes;
            i++
        ) {
            const fish = randomFish()

            const amount =
                randomAmount(
                    fish.min,
                    fish.max
                )

            caught[fish.id] =
                (
                    caught[fish.id] ||
                    0
                ) + amount
        }

        // ==============================
        // TOTAL TANGKAPAN
        // ==============================

        let totalCatch = 0

        for (
            const key of Object.keys(caught)
        ) {
            totalCatch += caught[key]
        }

        // ==============================
        // SIMPAN HASIL KE DATABASE
        // ==============================

        for (
            const fishId of Object.keys(caught)
        ) {
            const amount =
                caught[fishId]

            user[fishId] =
                Number(
                    user[fishId] || 0
                ) + amount
        }

        user.totalPancingan =
            Number(
                user.totalPancingan || 0
            ) + totalCatch

        // ==============================
        // KURANGI DURABILITY
        // ==============================

        user.fishingroddurability =
            durabilityAfter

        // ==============================
        // HASIL
        // ==============================

        const result = []

        for (
            const fish of FISH_TABLE
        ) {
            const amount =
                caught[fish.id] || 0

            if (amount > 0) {
                const rarity =
                    RARITY[fish.id] ||
                    'Common'

                result.push(
                    `${fish.emoji} ${fish.name}: ${amount} *[${rarity}]*`
                )
            }
        }

        // ==============================
        // PESAN HASIL
        // ==============================

        const resultText =
            `╭━━〔 🎣 *HASIL MANCING* 〕━━╮
│
${result.map(v => `│ ${v}`).join('\n')}
│
├──────────────────
│ 🎯 Total: *${totalCatch} ekor*
│ 🎣 Durability:
│    *${user.fishingroddurability}/50*
│
│ ⏰ Cooldown:
│    *10 Menit*
│
╰━━━━━━━━━━━━━━━━━━╯`

        // ==============================
        // EDIT PESAN HASIL
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

        // ==========================================
        // PENTING:
        // Tidak ada user.limit--
        // Tidak ada pengecekan premium.
        //
        // Setelah handler selesai normal,
        // loader yang menangani limit.
        // ==========================================

    } catch (err) {
        // ==============================
        // JIKA PROSES GAGAL
        // ==============================

        // Reset cooldown karena command
        // tidak berhasil menyelesaikan proses.
        user.lastmancing = 0

        throw err

    } finally {
        // ==============================
        // HAPUS LOCK
        // ==============================

        global.mancingLocks.delete(userId)
    }
}

// ==============================
// COMMAND SETTINGS
// ==============================

handler.help = [
    'mancing'
]

handler.tags = [
    'rpg'
]

handler.command =
    /^(mancing|memancing)$/i

handler.group = true
handler.rpg = true

// ==========================================
// LIMIT DITANGANI HANDLER UTAMA
// ==========================================

handler.limit = true

export default handler