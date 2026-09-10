//create code Wonge-bot

import TicTacToe from '../lib/tictactoe.js'

// ==================================================
// CONFIG
// ==================================================

const MIN_BET = 50000

const WAITING_TIMEOUT =
    60 * 1000

const AFK_TIMEOUT =
    5 * 60 * 1000

const ROOM_PREFIX =
    'tictactoe2-'

// ==================================================
// DATABASE
// ==================================================

global.db = global.db || {}
global.db.data = global.db.data || {}
global.db.data.users =
    global.db.data.users || {}

// ==================================================
// GET USERS
// ==================================================

const getUsers = () =>
    global.db.data.users

// ==================================================
// REFUND PLAYER
// ==================================================

const refundPlayer = (
    jid,
    amount
) => {

    if (!jid) {
        return
    }

    const users =
        getUsers()

    if (!users[jid]) {
        users[jid] = {}
    }

    const user =
        users[jid]

    const money =
        Number.isFinite(user.money)
            ? user.money
            : 0

    user.money =
        money + Number(amount || 0)
}

// ==================================================
// REFUND ROOM
// ==================================================

const refundRoom = room => {

    if (!room) {
        return
    }

    const bet =
        Number(room.bet || 0)

    // ==============================
    // PLAYER X
    // ==============================

    if (
        room.betPaidX &&
        room.game?.playerX
    ) {

        refundPlayer(
            room.game.playerX,
            bet
        )

        room.betPaidX =
            false
    }

    // ==============================
    // PLAYER O
    // ==============================

    if (
        room.betPaidO &&
        room.game?.playerO
    ) {

        refundPlayer(
            room.game.playerO,
            bet
        )

        room.betPaidO =
            false
    }
}

// ==================================================
// CLEAR ROOM TIMERS
// ==================================================

const clearRoomTimers = room => {

    if (!room) {
        return
    }

    if (room.waitingTimeout) {

        clearTimeout(
            room.waitingTimeout
        )

        room.waitingTimeout =
            null
    }

    if (room.afkTimeout) {

        clearTimeout(
            room.afkTimeout
        )

        room.afkTimeout =
            null
    }
}

// ==================================================
// DELETE ROOM + REFUND
// ==================================================

const cancelRoom = (
    conn,
    room
) => {

    if (!room) {
        return
    }

    clearRoomTimers(room)

    refundRoom(room)

    if (
        conn.game &&
        room.id &&
        conn.game[room.id]
    ) {
        delete conn.game[room.id]
    }
}

// ==================================================
// START AFK TIMER
// ==================================================

const startAfkTimer = (
    conn,
    room
) => {

    if (!conn || !room) {
        return
    }

    if (
        room.state !== 'PLAYING'
    ) {
        return
    }

    // ==============================
    // CLEAR TIMER LAMA
    // ==============================

    if (room.afkTimeout) {

        clearTimeout(
            room.afkTimeout
        )

        room.afkTimeout =
            null
    }

    // ==============================
    // INITIAL ACTIVITY
    // ==============================

    if (
        !Number.isFinite(
            Number(room.lastActivity)
        )
    ) {

        room.lastActivity =
            Date.now()
    }

    // ==============================
    // CHECK AFK
    // ==============================

    const checkAfk = () => {

        // ==========================
        // ROOM SUDAH HILANG
        // ==========================

        if (
            !conn.game ||
            !conn.game[room.id]
        ) {
            return
        }

        const currentRoom =
            conn.game[room.id]

        // ==========================
        // BUKAN PLAYING
        // ==========================

        if (
            currentRoom.state !==
            'PLAYING'
        ) {
            return
        }

        // ==========================
        // LAST ACTIVITY
        // ==========================

        const lastActivity =
            Number(
                currentRoom.lastActivity || 0
            )

        const inactiveTime =
            Date.now() -
            lastActivity

        // ==========================
        // BELUM AFK
        // ==========================

        if (
            inactiveTime <
            AFK_TIMEOUT
        ) {

            currentRoom.afkTimeout =
                setTimeout(
                    checkAfk,
                    Math.max(
                        1000,
                        AFK_TIMEOUT -
                        inactiveTime
                    )
                )

            return
        }

        // ==========================
        // AFK
        // REFUND + DELETE
        // ==========================

        cancelRoom(
            conn,
            currentRoom
        )
    }

    // ==============================
    // START TIMER
    // ==============================

    room.afkTimeout =
        setTimeout(
            checkAfk,
            AFK_TIMEOUT
        )
}

// ==================================================
// PATCH EXISTING PLAYING ROOMS
// ==================================================

const patchExistingRooms = conn => {

    if (!conn) {
        return
    }

    conn.game =
        conn.game || {}

    for (
        const room of Object.values(
            conn.game
        )
    ) {

        // ==========================
        // VALID ROOM
        // ==========================

        if (
            !room ||
            !room.id ||
            !room.id.startsWith(
                ROOM_PREFIX
            )
        ) {
            continue
        }

        // ==========================
        // WAITING
        // ==========================

        if (
            room.state === 'WAITING'
        ) {
            continue
        }

        // ==========================
        // PLAYING
        // ==========================

        if (
            room.state === 'PLAYING'
        ) {

            // Room lama yang belum
            // mempunyai chat.
            //
            // Ambil dari x sebagai
            // fallback kompatibilitas.

            if (!room.chat) {

                room.chat =
                    room.x || ''
            }

            // ======================
            // LAST ACTIVITY
            // ======================

            if (
                !Number.isFinite(
                    Number(room.lastActivity)
                )
            ) {

                room.lastActivity =
                    Date.now()
            }

            // ======================
            // START AFK
            // ======================

            startAfkTimer(
                conn,
                room
            )
        }
    }
}

// ==================================================
// WATCHER
// ==================================================

const setupWatcher = conn => {

    if (!conn) {
        return
    }

    conn.game =
        conn.game || {}

    // ==============================
    // CLEAR WATCHER LAMA
    // ==============================

    if (
        conn.tictactoe2Watcher
    ) {

        clearInterval(
            conn.tictactoe2Watcher
        )

        conn.tictactoe2Watcher =
            null
    }

    // ==============================
    // PATCH ROOM LAMA
    // ==============================

    patchExistingRooms(conn)

    // ==============================
    // WATCH ROOM BARU
    // ==============================

    conn.tictactoe2Watcher =
        setInterval(() => {

            if (!conn.game) {
                return
            }

            for (
                const room of Object.values(
                    conn.game
                )
            ) {

                if (
                    !room ||
                    !room.id ||
                    !room.id.startsWith(
                        ROOM_PREFIX
                    )
                ) {
                    continue
                }

                // ======================
                // PLAYING SAJA
                // ======================

                if (
                    room.state !==
                    'PLAYING'
                ) {
                    continue
                }

                // ======================
                // COMPATIBILITY
                // ======================

                if (!room.chat) {

                    room.chat =
                        room.x || ''
                }

                // ======================
                // LAST ACTIVITY
                // ======================

                if (
                    !Number.isFinite(
                        Number(
                            room.lastActivity
                        )
                    )
                ) {

                    room.lastActivity =
                        Date.now()
                }

                // ======================
                // PASTIKAN TIMER
                // ======================

                if (
                    !room.afkTimeout
                ) {

                    startAfkTimer(
                        conn,
                        room
                    )
                }
            }

        }, 10 * 1000)
}

// ==================================================
// HANDLER
// ==================================================

let handler = async (
    m,
    {
        conn,
        usedPrefix,
        command,
        text
    }
) => {

    // ==============================
    // DATABASE
    // ==============================

    global.db =
        global.db || {}

    global.db.data =
        global.db.data || {}

    global.db.data.users =
        global.db.data.users || {}

    const users =
        global.db.data.users

    // ==============================
    // USER
    // ==============================

    if (!users[m.sender]) {
        users[m.sender] = {}
    }

    const user =
        users[m.sender]

    // ==============================
    // REGISTER
    // ==============================

    if (!user.registered) {

        return m.reply(
            '❌ Kamu belum terdaftar.\n' +
            `Silakan daftar terlebih dahulu sebelum bermain ${usedPrefix}${command}.`
        )
    }

    // ==============================
    // GAME STORAGE
    // ==============================

    conn.game =
        conn.game || {}

    // ==============================
    // AKTIFKAN WATCHER
    // ==============================

    setupWatcher(conn)

    // ==============================
    // NORMALIZE TEXT
    // ==============================

    text =
        (text || '').trim()

    // ==================================================
    // CEK PEMAIN SEDANG BERMAIN
    // HANYA DI CHAT INI
    // ==================================================

    const existingGame =
        Object.values(
            conn.game
        ).find(room =>
            room &&
            room.id &&
            room.id.startsWith(
                ROOM_PREFIX
            ) &&
            room.state === 'PLAYING' &&
            (room.chat || room.x) ===
                m.chat &&
            room.game &&
            [
                room.game.playerX,
                room.game.playerO
            ].includes(
                m.sender
            )
        )

    if (existingGame) {

        return m.reply(
            '❌ Kamu masih berada di dalam game TTT2.'
        )
    }

    // ==================================================
    // JOIN ROOM
    // .ttt2
    // ==================================================

    if (!text) {

        // ==============================
        // CARI ROOM WAITING
        // KHUSUS CHAT INI
        // ==============================

        const room =
            Object.values(
                conn.game
            ).find(room =>
                room &&
                room.id &&
                room.id.startsWith(
                    ROOM_PREFIX
                ) &&
                room.state ===
                    'WAITING' &&
                (room.chat || room.x) ===
                    m.chat
            )

        if (!room) {

            return m.reply(
                '❌ Belum ada room TTT2 yang tersedia.\n\n' +
                `Untuk membuat room:\n` +
                `${usedPrefix}${command} <nominal>\n\n` +
                `💰 Minimal taruhan: ${MIN_BET.toLocaleString('id-ID')}`
            )
        }

        // ==============================
        // VALIDASI BET
        // ==============================

        const bet =
            Number(room.bet)

        if (
            !Number.isSafeInteger(
                bet
            ) ||
            bet < MIN_BET
        ) {

            return m.reply(
                '❌ Nominal taruhan room tidak valid.'
            )
        }

        // ==============================
        // PLAYER O
        // ==============================

        const playerO =
            users[m.sender]

        if (
            !playerO.registered
        ) {

            return m.reply(
                '❌ Kamu belum terdaftar.'
            )
        }

        // ==============================
        // MONEY PLAYER O
        // ==============================

        const playerOMoney =
            Number.isFinite(
                playerO.money
            )
                ? playerO.money
                : 0

        playerO.money =
            playerOMoney - bet

        // ==============================
        // BATALKAN WAITING TIMER
        // ==============================

        if (
            room.waitingTimeout
        ) {

            clearTimeout(
                room.waitingTimeout
            )

            room.waitingTimeout =
                null
        }

        // ==============================
        // PLAYER O
        // ==============================

        room.o =
            m.chat

        room.chat =
            m.chat

        room.game.playerO =
            m.sender

        room.betPaidO =
            true

        room.state =
            'PLAYING'

        // ==============================
        // POT
        // ==============================

        room.pot =
            bet * 2

        // ==============================
        // AKTIVITAS AWAL
        // ==============================

        room.lastActivity =
            Date.now()

        // ==============================
        // AFK TIMER
        // ==============================

        startAfkTimer(
            conn,
            room
        )

        // ==============================
        // BOARD
        // ==============================

        const arr =
            room.game.render().map(
                v => ({
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
                }[v])
            )

        // ==============================
        // MESSAGE
        // ==============================

        const str = `
🎲 *TIC TAC TOE 2*

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

💰 Taruhan: *${bet.toLocaleString('id-ID')}*
🏆 Pot: *${room.pot.toLocaleString('id-ID')}*

Giliran ${['❌', '⭕'][1 * room.game._currentTurn]}
@${room.game.currentTurn.split('@')[0]}

❌: @${room.game.playerX.split('@')[0]}
⭕: @${room.game.playerO.split('@')[0]}

Ketik *nyerah* untuk menyerah.

Room ID: ${room.id}
`.trim()

        // ==============================
        // PLAYER X
        // ==============================

        if (
            room.x !== room.o
        ) {

            m.reply(
                str,
                room.x,
                {
                    contextInfo: {
                        mentionedJid:
                            conn.parseMention(
                                str
                            )
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
                        conn.parseMention(
                            str
                        )
                }
            }
        )

        return
    }

    // ==================================================
    // CREATE ROOM
    // .ttt2 <nominal>
    // ==================================================

    if (
        !/^\d+$/.test(text)
    ) {

        return m.reply(
            '❌ Nominal taruhan tidak valid.\n\n' +
            `Contoh:\n${usedPrefix}${command} 50000\n\n` +
            `💰 Minimal taruhan: ${MIN_BET.toLocaleString('id-ID')}`
        )
    }

    const bet =
        Number(text)

    // ==============================
    // VALIDASI BET
    // ==============================

    if (
        !Number.isSafeInteger(
            bet
        ) ||
        bet < MIN_BET
    ) {

        return m.reply(
            `❌ Minimal taruhan adalah *${MIN_BET.toLocaleString('id-ID')}*.`
        )
    }

    // ==============================
    // MONEY PLAYER X
    // ==============================

    const money =
        Number.isFinite(
            user.money
        )
            ? user.money
            : 0

    if (
        money < bet
    ) {

        return m.reply(
            '❌ Money kamu tidak cukup.\n\n' +
            `💰 Money: *${money.toLocaleString('id-ID')}*\n` +
            `🎲 Taruhan: *${bet.toLocaleString('id-ID')}*`
        )
    }

    // ==============================
    // BUAT ROOM
    // ==============================

    const room = {

        id:
            ROOM_PREFIX +
            (+new Date),

        // ==========================
        // CHAT / GRUP PEMILIK ROOM
        // ==========================

        chat:
            m.chat,

        x:
            m.chat,

        o:
            '',

        // ==========================
        // GAME
        // ==========================

        game:
            new TicTacToe(
                m.sender,
                'o'
            ),

        // ==========================
        // STATE
        // ==========================

        state:
            'WAITING',

        // ==========================
        // BET
        // ==========================

        bet:
            bet,

        pot:
            bet,

        betPaidX:
            true,

        betPaidO:
            false,

        // ==========================
        // TIMER
        // ==========================

        waitingTimeout:
            null,

        afkTimeout:
            null,

        // ==========================
        // ACTIVITY
        // ==========================

        lastActivity:
            null
    }

    // ==============================
    // POTONG MONEY PLAYER X
    // ==============================

    user.money =
        money - bet

    // ==============================
    // SIMPAN ROOM
    // ==============================

    conn.game[
        room.id
    ] = room

    // ==================================================
    // WAITING TIMEOUT
    // ==================================================

    room.waitingTimeout =
        setTimeout(() => {

            // ==========================
            // ROOM SUDAH HILANG
            // ==========================

            if (
                !conn.game ||
                !conn.game[room.id]
            ) {
                return
            }

            const currentRoom =
                conn.game[
                    room.id
                ]

            // ==========================
            // HANYA WAITING
            // ==========================

            if (
                currentRoom.state !==
                'WAITING'
            ) {
                return
            }

            // ==========================
            // REFUND
            // ==========================

            const playerX =
                currentRoom.game?.playerX

            if (
                playerX &&
                currentRoom.betPaidX
            ) {

                refundPlayer(
                    playerX,
                    Number(
                        currentRoom.bet || 0
                    )
                )

                currentRoom.betPaidX =
                    false
            }

            // ==========================
            // CLEAR TIMER
            // ==========================

            currentRoom.waitingTimeout =
                null

            // ==========================
            // DELETE ROOM
            // ==========================

            delete conn.game[
                currentRoom.id
            ]

        }, WAITING_TIMEOUT)

    // ==================================================
    // WAITING MESSAGE
    // ==================================================

    const waitingText = `
🎲 *TIC TAC TOE 2*

Room taruhan berhasil dibuat.

💰 Taruhan: *${bet.toLocaleString('id-ID')}*
🏆 Pot sementara: *${bet.toLocaleString('id-ID')}*

⏳ Menunggu pemain kedua...
Room otomatis dibatalkan dalam *1 menit* jika tidak ada yang masuk.

Pemain kedua cukup mengetik:
*${usedPrefix}${command}*

💰 Minimal taruhan: *${MIN_BET.toLocaleString('id-ID')}*

Room ID: ${room.id}
`.trim()

    return m.reply(
        waitingText
    )
}

// ==================================================
// HANDLER CONFIG
// ==================================================

handler.help = [
    'ttt2 <nominal>',
    'ttt2'
]

handler.tags = [
    'game'
]

handler.command =
    /^ttt2$/i

export default handler