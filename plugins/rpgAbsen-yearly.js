//create code Wonge-bot

const free = 20000
const prem = 40000
const limitfree = 200
const limitprem = 400
const moneyfree = 50000000
const moneyprem = 150000000
const timeout = 31536000000

let handler = async function (m, { conn, isPrems }) {
    let time = global.db.data.users[m.sender].lastyearly + timeout

    if (new Date() - global.db.data.users[m.sender].lastyearly < timeout) {
        throw 'Anda sudah mengklaim, klaim tahunan ini\ntunggu selama ' + msToTime(time - new Date()) + ' lagi'
    }

    global.db.data.users[m.sender].exp += isPrems ? prem : free
    global.db.data.users[m.sender].money += isPrems ? moneyprem : moneyfree
    global.db.data.users[m.sender].limit += isPrems ? limitprem : limitfree
    // global.db.data.users[m.sender].pet += 3

    conn.reply(
        m.chat,
        'Selamat kamu mendapatkan:\n\n+' +
            (isPrems ? prem : free) +
            ' Exp\n+' +
            (isPrems ? moneyprem : moneyfree) +
            ' Money\n+' +
            (isPrems ? limitprem : limitfree) +
            ' Limit',
        m
    )

    global.db.data.users[m.sender].lastyearly = new Date().getTime()
}

handler.help = ['tahunan']
handler.tags = ['rpgabsen']
handler.command = /^(tahunan)$/i
handler.limit = false
handler.rpg = true
handler.fail = null

export default handler

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
    var seconds = Math.floor((duration / 1000) % 60)
    var minutes = Math.floor((duration / (1000 * 60)) % 60)
    var hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    var monthly = Math.floor((duration / (1000 * 60 * 60 * 24)) % 720)

    monthly = monthly < 10 ? '0' + monthly : monthly
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    return monthly + ' hari ' + hours + ' jam ' + minutes + ' menit'
}