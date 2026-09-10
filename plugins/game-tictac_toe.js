//create code Wonge-bot

import util from 'util'

let handler = m => m

let debugMode = false

const winScore = 500
const playScore = 50

handler.before = function (m) {
    let ok
    let isWin = false
    let isSurrender = false

    this.game = this.game ? this.game : {}

    let room = Object.values(this.game).find(room =>
        room.id &&
        room.game &&
        room.state &&
        room.id.startsWith('tictactoe') &&
        [
            room.game.playerX,
            room.game.playerO
        ].includes(m.sender) &&
        room.state === 'PLAYING'
    )

    if (!room) return true

    /*
     * Hanya menerima:
     *
     * 1-9
     * nyerah
     * menyerah
     * surrender
     */
    if (!/^([1-9]|(me)?nyerah|surr?ender)$/i.test(m.text)) {
        return true
    }

    isSurrender = !/^[1-9]$/.test(m.text)

    /*
     * Kalau bukan giliran pemain,
     * hanya surrender yang diproses.
     */
    if (m.sender !== room.game.currentTurn) {
        if (!isSurrender) return true
    }

    if (debugMode) {
        m.reply(
            '[DEBUG]\n' +
            util.format({
                isSurrender,
                text: m.text
            })
        )
    }

    /*
     * ==========================
     * LANGKAH NORMAL
     * ==========================
     */
    if (!isSurrender) {

        ok = room.game.turn(
            m.sender === room.game.playerO,
            parseInt(m.text) - 1
        )

        if (ok < 1) {

            m.reply({
                '-3': 'Game telah berakhir',
                '-2': 'Invalid',
                '-1': 'Posisi Invalid',
                '0': 'Posisi sudah dipakai'
            }[ok] || 'Posisi Invalid')

            return true
        }
    }

    /*
     * ==========================
     * CEK MENANG
     * ==========================
     */
    if (m.sender === room.game.winner) {
        isWin = true
    }

    /*
     * Tidak ada pengecekan:
     *
     * room.game.board === 511
     *
     * karena sekarang papan boleh
     * terus berubah.
     */

    /*
     * ==========================
     * RENDER
     * ==========================
     */
    let arr = room.game.render().map(v => {
        return {
            X: '❌',
            O: '⭕',
            1: '1️⃣',
            2: '2️⃣',
            3: '3️⃣',
            4: '4️⃣',
            5: '5️⃣',
            6: '6️⃣',
            7: '7️⃣',
            8: '8️⃣',
            9: '9️⃣'
        }[v]
    })

    /*
     * ==========================
     * SURRENDER
     * ==========================
     */
    if (isSurrender) {

        room.game._currentTurn =
            m.sender === room.game.playerX

        isWin = true
    }

    let winner = isSurrender
        ? room.game.currentTurn
        : room.game.winner

    /*
     * ==========================
     * PESAN GAME
     * ==========================
     */
    let str = `
${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

${
    isWin
        ? `@${winner.split('@')[0]} Menang! (+${winScore} XP)`
        : `Giliran ${['❌', '⭕'][1 * room.game._currentTurn]} (@${room.game.currentTurn.split('@')[0]})`
}

❌: @${room.game.playerX.split('@')[0]}
⭕: @${room.game.playerO.split('@')[0]}

Ketik *nyerah* untuk nyerah
Room ID: ${room.id}
`.trim()

    /*
     * ==========================
     * UPDATE CHAT
     * ==========================
     */
    if (
        (
            room.game._currentTurn ^ isSurrender
                ? room.x
                : room.o
        ) !== m.chat
    ) {
        room[
            room.game._currentTurn ^ isSurrender
                ? 'x'
                : 'o'
        ] = m.chat
    }

    if (room.x !== room.o) {
        m.reply(str, room.x, {
            contextInfo: {
                mentionedJid: this.parseMention(str)
            }
        })
    }

    m.reply(str, room.o, {
        contextInfo: {
            mentionedJid: this.parseMention(str)
        }
    })

    /*
     * ==========================
     * GAME SELESAI
     * ==========================
     */
    if (isWin) {

        let users = global.db.data.users

        users[room.game.playerX].exp =
            (users[room.game.playerX].exp || 0) +
            playScore

        users[room.game.playerO].exp =
            (users[room.game.playerO].exp || 0) +
            playScore

        if (winner && users[winner]) {
            users[winner].exp =
                (users[winner].exp || 0) +
                (winScore - playScore)
        }

        if (debugMode) {
            m.reply(
                '[DEBUG]\n' +
                util.format(room)
            )
        }

        delete this.game[room.id]
    }

    return true
}

export default handler