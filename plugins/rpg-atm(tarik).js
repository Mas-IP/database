//create code Wonge-bot

let handler = async (m, { args }) => {
    // ==============================
    // DATABASE
    // ==============================
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}

    const user = global.db.data.users[m.sender]

    if (!user) {
        throw 'User tidak ada di database'
    }

    // ==============================
    // NOMINAL
    // ==============================
    if (!args[0]) {
        throw 'Masukkan nominal atau *all*\n\nContoh:\n.tarik 5000\n.tarik all'
    }

    let amount

    if (args[0].toLowerCase() === 'all') {
        amount = Number(user.bank) || 0
    } else {
        amount = parseInt(args[0])
    }

    // ==============================
    // VALIDASI
    // ==============================
    if (isNaN(amount) || amount <= 0) {
        throw 'Nominal tidak valid'
    }

    if ((Number(user.bank) || 0) < amount) {
        throw 'Saldo bank kamu tidak cukup 😢'
    }

    // ==============================
    // PROSES TARIK
    // ==============================
    user.bank -= amount
    user.money = (Number(user.money) || 0) + amount

    // ==============================
    // RESPONSE
    // ==============================
    return m.reply(
`🏧 *TARIK BERHASIL*

➖ Bank  : -${amount.toLocaleString('id-ID')}
💰 Money : ${user.money.toLocaleString('id-ID')}
🏦 Bank  : ${user.bank.toLocaleString('id-ID')}`
    )
}

handler.help = [
    'tarik <nominal>',
    'tarik all'
]

handler.tags = ['rpg']

handler.command = /^tarik$/i

handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.limit = false
handler.admin = false
handler.botAdmin = false
handler.rpg = true

handler.fail = null
handler.exp = 0

export default handler