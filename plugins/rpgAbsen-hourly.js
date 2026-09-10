//create code Wonge-bot

const free = 50
const prem = 100
const moneyfree = 5000
const moneyprem = 15000
const timeout = 3600000

let handler = async function (m, { conn, isPrems }) {
    let time = global.db.data.users[m.sender].lasthourly + timeout

    if (new Date() - global.db.data.users[m.sender].lasthourly < timeout) {
        return conn.reply(
            m.chat,
            'Anda sudah mengklaim, klaim harian hari ini\ntunggu selama ' + msToTime(time - new Date()) + ' lagi',
            m
        )
    }

    global.db.data.users[m.sender].exp += isPrems ? prem : free
    global.db.data.users[m.sender].money += isPrems ? moneyprem : moneyfree
    // global.db.data.users[m.sender].potion += 5

    conn.reply(
        m.chat,
        'Selamat kamu mendapatkan:\n\n+' +
            (isPrems ? prem : free) +
            ' Exp\n+' +
            (isPrems ? moneyprem : moneyfree) +
            ' Money',
        m
    )

    global.db.data.users[m.sender].lasthourly = new Date().getTime()
}

handler.help = ['hourly']
handler.tags = ['rpgabsen']
handler.command = /^(hourly)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.rpg = true
handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.money = 0
handler.exp = 0
handler.limit = true

export default handler

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
    var seconds = Math.floor((duration / 1000) % 60)
    var minutes = Math.floor((duration / (1000 * 60)) % 60)
    var hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    return hours + ' jam ' + minutes + ' menit ' + seconds + ' detik'
}