//create code Wonge-bot

import similarity from 'similarity'

const poin = 10000
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    if (!m.quoted) return true

    const id = m.chat

    this.tebakislami = this.tebakislami
        ? this.tebakislami
        : {}

    if (!(id in this.tebakislami)) return true

    if (
        m.quoted.id !==
        this.tebakislami[id][0].key.id
    ) {
        return true
    }

    const users = global.db.data.users[m.sender]
    const json = this.tebakislami[id][1]

    const input = String(m.text || '')
        .toLowerCase()
        .trim()

    const answerIndex = [
        'a',
        'b',
        'c',
        'd'
    ].indexOf(input)

    if (answerIndex === -1) return true

    const pilihanUser = json.pilihan[answerIndex]

    if (!pilihanUser) return true

    const jawaban = String(json.jawaban)
        .toLowerCase()
        .trim()

    const pilihan = String(pilihanUser)
        .toLowerCase()
        .trim()

    // =========================
    // JAWABAN BENAR
    // =========================

    if (pilihan === jawaban) {
        users.exp += this.tebakislami[id][2]
        users.money += poin

        await m.reply(
            `*Benar!*\n` +
            `+${poin} Money\n\n` +
            `${json.deskripsi || ''}`
        )

        clearTimeout(
            this.tebakislami[id][3]
        )

        delete this.tebakislami[id]

        return true
    }

    // =========================
    // JAWABAN SALAH
    // =========================

    if (
        similarity(pilihan, jawaban) >= threshold
    ) {
        await m.reply(
            `*Salah!*\n` +
            `Jawaban yang benar: *${json.jawaban}*`
        )
    } else {
        await m.reply(
            `*Salah!*\n` +
            `Jawaban yang benar: *${json.jawaban}*`
        )
    }

    // Sekali salah langsung selesai
    clearTimeout(
        this.tebakislami[id][3]
    )

    delete this.tebakislami[id]

    return true
}

handler.exp = 0

export default handler