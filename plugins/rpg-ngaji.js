//create code Wonge-bot

let handler = async (m, { conn }) => {
    let lastngaji = global.db.data.users[m.sender]?.lastngaji || 0
    let timers = 300000 - (Date.now() - lastngaji)
    let name = await conn.getName(m.sender)
    let user = global.db.data.users[m.sender]

    if (timers <= 0) {
        let randomaku1 = Math.floor(Math.random() * 10)
        let randomaku2 = Math.floor(Math.random() * 10)
        let randomaku4 = Math.floor(Math.random() * 5)
        let randomaku3 = Math.floor(Math.random() * 10)
        let randomaku5 = Math.floor(Math.random() * 10)

        let rbrb1 = randomaku1 * 2
        let rbrb2 = randomaku2 * 10
        let rbrb3 = randomaku3 * 1
        let rbrb4 = randomaku4 * 15729
        let rbrb5 = randomaku5 * 20000

        let dimas = `Ketemu ustadz...`

        let dimas2 = `Mulai mengaji`

        let dimas3 = `Diajarin tajwid`

        let dimas4 = `Ngasih tau, kalo qalqalah itu dipantulkan`

        let hsl = `*—[ Hasil Ngaji ${name} ]—*
➕💹 Uang jajan: ${rbrb4}
➕✨ Exp: ${rbrb5}
➕🤬 Dimarahin: -1`

        // Set cooldown dari awal
        user.lastngaji = Date.now()

        // Kirim pesan pertama
        let msg = await conn.reply(m.chat, "Mencari Guru Ngaji.....", m)

        setTimeout(async () => {
            try {
                await conn.sendMessage(m.chat, {
                    text: dimas,
                    edit: msg.key
                })
            } catch {}
        }, 10000)

        setTimeout(async () => {
            try {
                await conn.sendMessage(m.chat, {
                    text: dimas2,
                    edit: msg.key
                })
            } catch {}
        }, 15000)

        setTimeout(async () => {
            try {
                await conn.sendMessage(m.chat, {
                    text: dimas3,
                    edit: msg.key
                })
            } catch {}
        }, 20000)

        setTimeout(async () => {
            try {
                await conn.sendMessage(m.chat, {
                    text: dimas4,
                    edit: msg.key
                })
            } catch {}
        }, 25000)

        setTimeout(async () => {
            try {
                user.warn -= 1
                user.money += rbrb4
                user.exp += rbrb5

                await conn.sendMessage(m.chat, {
                    text: hsl,
                    edit: msg.key
                })
            } catch {
                user.warn -= 1
                user.money += rbrb4
                user.exp += rbrb5

                conn.reply(m.chat, hsl, m)
            }
        }, 27000)

    } else {
        let clock = clockString(timers)
        conn.reply(
            m.chat,
            `Sepertinya Kamu Sudah Kecapekan Silahkan Istirahat Dulu Selama\n*${clock}*`,
            m
        )
    }
}

handler.help = ['mengaji']
handler.tags = ['rpg']
handler.command = /^(mengajikeliling|mengaji|ngaji|ustad|ustadz|ustaz)$/i
handler.register = true
handler.rpg = true
handler.limit = true

export default handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60

    return [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}