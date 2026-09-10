//create code Wonge-bot

let handler = async (m, { conn, command, args }) => {
    const user = global.db.data.users[m.sender]
    const tag = `@${m.sender.replace(/@.+/, '')}`

    try {
        // ==========================================
        // VALIDASI AKUN YOUTUBE
        // ==========================================

        if (!user.youtube_account) {
            throw `Hey Kamu Iya Kamu ${tag}\nBuat akun terlebih dahulu\nKetik: .createakunyt`
        }

        // ==========================================
        // VALIDASI JUDUL
        // ==========================================

        const title = args.join(' ')

        if (!title) {
            throw `${tag} Silakan berikan judul untuk live Anda.`
        }

        if (title.length > 50) {
            throw `${tag} Judul live maksimal 50 karakter.`
        }

        // ==========================================
        // COOLDOWN
        // ==========================================

        const cooldownTime = 600000 // 10 menit
        const lastLiveTime = Number(user.lastLiveTime || 0)
        const now = Date.now()
        const timeSinceLastLive = now - lastLiveTime

        if (timeSinceLastLive < cooldownTime) {
            const remainingCooldown = cooldownTime - timeSinceLastLive
            const formattedCooldown = msToTime(remainingCooldown)

            throw `Kamu sudah lelah. Tunggu selama\n${formattedCooldown}`
        }

        // ==========================================
        // HASIL LIVE
        // ==========================================

        const randomSubscribers =
            Math.floor(Math.random() * (3000 - 10 + 1)) + 10

        const randomLike =
            Math.floor(Math.random() * (1000 - 20 + 1)) + 20

        const randomViewers =
            Math.floor(Math.random() * (1000000 - 100 + 1)) + 100

        const randomDonation =
            Math.floor(Math.random() * (200000 - 10000 + 1)) + 10000

        // ==========================================
        // UPDATE DATABASE
        // ==========================================

        user.subscribers += randomSubscribers
        user.like += randomLike
        user.viewers += randomViewers
        user.money += randomDonation

        // Simpan waktu command berhasil digunakan
        user.lastLiveTime = now

        // ==========================================
        // MILESTONE PLAYBUTTON
        // ==========================================

        if (user.subscribers >= 1000000 && user.playButton < 3) {
            user.playButton += 1

            user.money +=
                Math.floor(Math.random() * (1000000 - 500000 + 1)) + 500000

            user.exp += 5000

            await conn.reply(
                m.chat,
                `📢 Congratulation! Anda telah mencapai milestone subscribers dan mendapatkan *🥇 Diamond PlayButton* serta hadiah Money dan exp! 🎉\n\n📢 Cek Progresmu Dengan cara *.akunyt*`,
                m
            )

        } else if (user.subscribers >= 100000 && user.playButton < 2) {
            user.playButton += 1

            user.money +=
                Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000

            user.exp += 2500

            await conn.reply(
                m.chat,
                `📢 Congratulation! Anda telah mencapai milestone subscribers dan mendapatkan *🥈 Gold PlayButton* serta hadiah Money dan exp! 🎉\n\n📢 Cek Progresmu Dengan cara *.akunyt*`,
                m
            )

        } else if (user.subscribers >= 10000 && user.playButton < 1) {
            user.playButton += 1

            user.money +=
                Math.floor(Math.random() * (250000 - 10000 + 1)) + 10000

            user.exp += 500

            await conn.reply(
                m.chat,
                `📢 Congratulation! ${tag}, telah mencapai milestone subscribers dan mendapatkan *🥉 Silver PlayButton* serta hadiah Money dan exp! 🎉\n\n📢 Cek Progresmu Dengan cara *.akunyt*`,
                m
            )
        }

        // ==========================================
        // FORMAT HASIL
        // ==========================================

        const formattedSubscribers =
            formatNumber(user.subscribers)

        const formattedLike =
            formatNumber(user.like)

        const formattedViewers =
            formatNumber(user.viewers)

        const formattedDonation =
            formatCurrency(randomDonation)

        // ==========================================
        // HASIL LIVE
        // ==========================================

        await conn.reply(
            m.chat,
            `
[ 🎦 ] Hasil Live Streaming

🧑🏻‍💻 *Streamer:* ${tag}
📹 *Judul Live:* ${title}
📈 *New Subscribers:* +${formatNumber(randomSubscribers)}
👍🏻 *New Like:* +${formatNumber(randomLike)}
🪬 *New Viewers:* +${formatNumber(randomViewers)}
💵 *Donasi:* ${formattedDonation}

📊 *Total Like:* ${formattedLike}
📊 *Total Viewers:* ${formattedViewers}
📊 *Total Subscribers:* ${formattedSubscribers}

> Cek akun YouTube Anda
> Ketik: .akunyt
`.trim(),
            m
        )

        // Tidak perlu user.limit--
        // Limit sepenuhnya ditangani oleh handler utama.

    } catch (err) {
        // Semua kegagalan dilempar ke handler utama
        // sehingga m.error terisi dan limit tidak dipotong.
        throw err
    }
}

// ==========================================
// FORMAT ANGKA
// ==========================================

function formatNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(1) + 'T'
    }

    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'M'
    }

    if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'Jt'
    }

    if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K'
    }

    return String(num)
}

// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(num) {
    return 'Rp' + new Intl.NumberFormat('id-ID').format(num)
}

// ==========================================
// FORMAT COOLDOWN
// ==========================================

function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    const formattedTime = []

    if (hours > 0) {
        formattedTime.push(`${hours} jam`)
    }

    if (minutes > 0) {
        formattedTime.push(`${minutes} menit`)
    }

    if (seconds > 0 || formattedTime.length === 0) {
        formattedTime.push(`${seconds} detik`)
    }

    return formattedTime.join(' ')
}

// ==========================================
// HANDLER SETTINGS
// ==========================================

handler.help = ['ytlive']
handler.tags = ['rpg']
handler.command = /^(ytlive|ytstreaming)$/i
handler.register = true
handler.rpg = true
handler.group = true

// Limit ditangani oleh handler utama.
handler.limit = true

export default handler