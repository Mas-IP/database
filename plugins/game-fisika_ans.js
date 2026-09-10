//create code Wonge-bot

let poin = 10000
let handler = m => m

handler.before = async function (m) {
    if (!m.quoted) return !0

    let id = m.chat

    this.fisika = this.fisika ? this.fisika : {}

    if (!(id in this.fisika)) return !0

    let game = this.fisika[id]

    if (!game) return !0

    if (m.quoted.id !== game[0].key.id) return !0

    let input = (m.text || '').toLowerCase().trim()
    let answerIndex = ['a', 'b', 'c', 'd'].indexOf(input)

    if (answerIndex === -1) return !0

    let users = global.db.data.users[m.sender]
    let json = game[1]

    let pilihanUser = json.pilihan[answerIndex]
    let jawaban = json.jawaban.toLowerCase().trim()

    if (!pilihanUser) return !0

    let timeout = game[3]

    // Jawaban pertama langsung mengakhiri sesi
    delete this.fisika[id]

    if (timeout) {
        clearTimeout(timeout)
    }

    // ===== BENAR =====
    if (pilihanUser.toLowerCase() === jawaban) {
        users.exp += game[2]
        users.money += poin

        m.reply(
            `*Benar!* 🎉\n` +
            `+${poin} Money\n\n` +
            `${json.deskripsi}`
        )
    }

    // ===== SALAH =====
    else {
        m.reply(
            `*Salah!* ❌\n\n` +
            `Jawaban kamu: *${input.toUpperCase()}*\n` +
            `Jawaban yang benar: *${json.jawaban}*\n\n` +
            `Game berakhir.`
        )
    }

    return !0
}

handler.exp = 0

export default handler