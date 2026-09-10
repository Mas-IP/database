//create code Wonge-bot

let handler = m => m

const debugMode = false

handler.before = function (m) {

    let ok
    let isWin = false
    let isDraw = false
    let isSurrender = false

    // ==============================
    // GAME STORAGE
    // ==============================

    this.game = this.game || {}

    // ==============================
    // DATABASE
    // ==============================

    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}

    const users = global.db.data.users

    // ==============================
    // CARI ROOM TTT2
    // ==============================

    const room = Object.values(this.game).find(room =>
        room &&
        room.id &&
        room.id.startsWith('tictactoe2-') &&
        room.game &&
        room.state === 'PLAYING' &&
        room.game.playerX &&
        room.game.playerO &&
        [
            room.game.playerX,
            room.game.playerO
        ].includes(m.sender) &&
        (
            m.chat === room.x ||
            m.chat === room.o
        )
    )

    /*
     * Hanya room TTT2 aktif
     * yang diproses.
     */

    if (!room) return true

    // ==============================
    // VALIDASI CHAT
    // ==============================

    if (
        m.chat !== room.x &&
        m.chat !== room.o
    ) {
        return true
    }

    // ==============================
    // INPUT
    // ==============================

    const text =
        String(m.text || '').trim()

    if (
        !/^([1-9]|(me)?nyerah|surr?ender)$/i.test(text)
    ) {
        return true
    }

    // ==============================
    // SURRENDER
    // ==============================

    isSurrender =
        !/^[1-9]$/.test(text)

    // ==============================
    // CEK GILIRAN
    // ==============================

    if (
        m.sender !== room.game.currentTurn
    ) {

        if (!isSurrender) {
            return true
        }
    }

    // ==============================
    // NORMAL MOVE
    // ==============================

    if (!isSurrender) {

        ok = room.game.turn(
            m.sender === room.game.playerO,
            parseInt(text) - 1
        )

        if (ok < 1) {

            m.reply({
                '-3': 'Game telah berakhir.',
                '-2': 'Invalid.',
                '-1': 'Posisi invalid.',
                '0': 'Posisi sudah dipakai.'
            }[ok] || 'Posisi invalid.')

            return true
        }
    }

    // ==============================
    // CEK MENANG
    // ==============================

    if (
        m.sender === room.game.winner
    ) {
        isWin = true
    }

    // ==============================
    // SURRENDER
    // ==============================

    if (isSurrender) {

        room.game._currentTurn =
            m.sender === room.game.playerX

        isWin = true
    }

    // ==============================
    // CEK DRAW
    // ==============================

    if (
        !isWin &&
        !isSurrender
    ) {

        const board =
            room.game.render()

        isDraw =
            board.every(v =>
                v === 'X' ||
                v === 'O'
            )
    }

    // ==============================
    // WINNER
    // ==============================

    let winner = null

    if (isSurrender) {

        winner =
            m.sender === room.game.playerX
                ? room.game.playerO
                : room.game.playerX

    } else if (isWin) {

        winner =
            room.game.winner
    }

    // ==============================
    // BOARD
    // ==============================

    const arr =
        room.game.render().map(v => {

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

    // ==============================
    // STATUS
    // ==============================

    let statusText

    if (isDraw) {

        statusText =
            '🤝 *DRAW!*\n' +
            'Taruhan dikembalikan kepada kedua pemain.'

    } else if (
        isWin &&
        winner
    ) {

        statusText =
            `🏆 @${winner.split('@')[0]} Menang!\n` +
            `💰 Mendapatkan pot *${Number(room.pot).toLocaleString('id-ID')}*`

    } else {

        const turnSymbol =
            room.game._currentTurn
                ? '⭕'
                : '❌'

        statusText =
            `Giliran ${turnSymbol} ` +
            `@${room.game.currentTurn.split('@')[0]}`
    }

    // ==============================
    // MESSAGE
    // ==============================

    const str = `
🎲 *TIC TAC TOE 2*

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

💰 Taruhan: *${Number(room.bet).toLocaleString('id-ID')}*
🏆 Pot: *${Number(room.pot).toLocaleString('id-ID')}*

${statusText}

❌: @${room.game.playerX.split('@')[0]}
⭕: @${room.game.playerO.split('@')[0]}

${isWin || isDraw
        ? ''
        : 'Ketik *nyerah* untuk menyerah'}

Room ID: ${room.id}
`.trim()

    // ==============================
    // PLAYER X
    // ==============================

    if (room.x !== room.o) {

        m.reply(
            str,
            room.x,
            {
                contextInfo: {
                    mentionedJid:
                        this.parseMention(str)
                }
            }
        )
    }

    // ==============================
    // PLAYER O
    // ==============================

    m.reply(
        str,
        room.o,
        {
            contextInfo: {
                mentionedJid:
                    this.parseMention(str)
            }
        }
    )

    // ==============================
    // SETTLEMENT
    // ==============================

    if (
        isWin ||
        isDraw
    ) {

        const playerX =
            room.game.playerX

        const playerO =
            room.game.playerO

        users[playerX] =
            users[playerX] || {}

        users[playerO] =
            users[playerO] || {}

        // ==============================
        // BET & POT
        // ==============================

        const bet =
            Number(room.bet || 0)

        const pot =
            Number(
                room.pot ||
                (bet * 2)
            )

        // ==============================
        // DRAW
        // ==============================

        if (isDraw) {

            const moneyX =
                Number.isFinite(
                    users[playerX].money
                )
                    ? users[playerX].money
                    : 0

            const moneyO =
                Number.isFinite(
                    users[playerO].money
                )
                    ? users[playerO].money
                    : 0

            users[playerX].money =
                moneyX + bet

            users[playerO].money =
                moneyO + bet
        }

        // ==============================
        // WINNER
        // ==============================

        else if (
            winner &&
            users[winner]
        ) {

            const winnerMoney =
                Number.isFinite(
                    users[winner].money
                )
                    ? users[winner].money
                    : 0

            users[winner].money =
                winnerMoney + pot
        }

        // ==============================
        // HAPUS ROOM
        // ==============================

        delete this.game[room.id]
    }

    // ==============================
    // DEBUG
    // ==============================

    if (debugMode) {

        console.log({
            room: room.id,
            playerX: room.game.playerX,
            playerO: room.game.playerO,
            bet: room.bet,
            pot: room.pot,
            winner,
            isWin,
            isDraw,
            isSurrender
        })
    }

    return true
}

export default handler