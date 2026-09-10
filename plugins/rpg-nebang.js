//create code Wonge-bot

const timeout = 15 * 60 * 1000 // 15 menit

const AXE_MAX_DURABILITY = 50
const AXE_USE_DURABILITY = 10

const MIN_WOOD = 20
const MAX_WOOD = 30

let handler = async (m, { conn, usedPrefix }) => {

    // ==============================
    // DATABASE
    // ==============================
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}

    const users = global.db.data.users
    const user = users[m.sender]

    if (!user) {
        throw '❌ Data user tidak ditemukan di database.'
    }

    // ==============================
    // DEFAULT DATA
    // ==============================
    if (typeof user.axe !== 'number') {
        user.axe = 0
    }

    if (typeof user.axedurability !== 'number') {
        user.axedurability = 0
    }

    if (typeof user.kayu !== 'number') {
        user.kayu = 0
    }

    if (typeof user.lastnebang !== 'number') {
        user.lastnebang = 0
    }

    // ==============================
    // 1. DETEKSI AXE
    // ==============================
    if (
        user.axe <= 0 ||
        user.axedurability < AXE_USE_DURABILITY
    ) {
        throw (
            `❌ *Axe tidak cukup!*\n\n` +
            `🪓 Axe : *${user.axe > 0 ? 'Ada' : 'Tidak ada'}*\n` +
            `🛠️ Durability : *${user.axedurability}/${AXE_MAX_DURABILITY}*\n` +
            `⚒️ Dibutuhkan : *${AXE_USE_DURABILITY} durability*\n\n` +
            `Gunakan *${usedPrefix}craft axe* untuk menambah durability.`
        )
    }

    // ==============================
    // 2. DETEKSI COOLDOWN
    // ==============================
    const now = Date.now()

    const nextNgebang =
        user.lastnebang + timeout

    if (
        user.lastnebang > 0 &&
        now - user.lastnebang < timeout
    ) {
        throw (
            `❌ *Kamu belum bisa menebang!*\n\n` +
            `🌲 Kamu masih dalam cooldown.\n\n` +
            `⏳ Sisa waktu : *${msToTime(nextNgebang - now)}*`
        )
    }

    // ==============================
    // SEMUA SYARAT LOLOS
    // ==============================

    // ==============================
    // DURABILITY SEBELUM DIGUNAKAN
    // ==============================
    const durabilityBefore =
        user.axedurability

    // ==============================
    // PERSENTASE DURABILITY
    // ==============================
    let durabilityPercent =
        (durabilityBefore /
            AXE_MAX_DURABILITY) * 100

    if (durabilityPercent > 100) {
        durabilityPercent = 100
    }

    // ==============================
    // RANDOM HASIL KAYU
    // ==============================
    const baseWood =
        Math.floor(
            Math.random() *
            (MAX_WOOD - MIN_WOOD + 1)
        ) + MIN_WOOD

    // ==============================
    // PENGARUH DURABILITY
    // ==============================
    let kayu =
        Math.floor(
            baseWood *
            (durabilityPercent / 100)
        )

    if (kayu < 1) {
        kayu = 1
    }

    // ==============================
    // KURANGI AXE
    // ==============================
    user.axedurability -=
        AXE_USE_DURABILITY

    if (user.axedurability <= 0) {
        user.axedurability = 0
        user.axe = 0
    }

    // ==============================
    // TAMBAH KAYU
    // ==============================
    user.kayu += kayu

    // ==============================
    // SIMPAN COOLDOWN
    // ==============================
    user.lastnebang = now

    // ==============================
    // HASIL
    // ==============================
    let caption =
        `🌲 *NEBANG BERHASIL*\n\n` +
        `🪓 Axe : *-${AXE_USE_DURABILITY} durability*\n` +
        `📊 Kondisi Axe : *${Math.floor(durabilityPercent)}%*\n\n` +
        `🪵 Kayu : *+${kayu}*\n` +
        `📦 Total Kayu : *${user.kayu}*\n\n` +
        `🛠️ Durability : *${user.axedurability}/${AXE_MAX_DURABILITY}*`

    // ==============================
    // AXE HABIS
    // ==============================
    if (user.axedurability <= 0) {
        caption +=
            `\n\n💥 *Axe kamu habis!*` +
            `\n🛠️ Gunakan *${usedPrefix}craft axe* untuk membeli durability lagi.`
    }

    // ==============================
    // COOLDOWN 15 MENIT
    // ==============================
    caption +=
        `\n\n⏳ Cooldown : *15 menit*`

    return conn.reply(
        m.chat,
        caption,
        m
    )
}

// ==============================
// HANDLER CONFIG
// ==============================
handler.help = ['nebang']
handler.tags = ['rpg']
handler.command = /^(nebang)$/i

handler.group = true
handler.rpg = true

// Limit ditangani oleh sistem loader
handler.limit = true

handler.exp = 0
handler.money = 0
handler.fail = null

export default handler

// ==============================
// FORMAT WAKTU
// ==============================
function msToTime(duration) {

    if (duration <= 0) {
        return '00 jam 00 menit 00 detik'
    }

    const seconds =
        Math.floor(
            (duration / 1000) % 60
        )

    const minutes =
        Math.floor(
            (duration / (1000 * 60)) % 60
        )

    const hours =
        Math.floor(
            duration /
            (1000 * 60 * 60)
        )

    const h =
        hours < 10
            ? '0' + hours
            : hours

    const m =
        minutes < 10
            ? '0' + minutes
            : minutes

    const s =
        seconds < 10
            ? '0' + seconds
            : seconds

    return (
        h +
        ' jam ' +
        m +
        ' menit ' +
        s +
        ' detik'
    )
}