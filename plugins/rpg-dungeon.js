//create code Wonge-bot

const BATTLE_DELAY_MIN = 1000
const BATTLE_DELAY_MAX = 11000

let handler = async (m, { conn, usedPrefix, command, text }) => {

    // ==============================
    // DATABASE
    // ==============================
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}

    const users = global.db.data.users
    const user = users[m.sender]

    if (!user) {
        throw '❌ Data user tidak ditemukan di database.'
    }

    // ==============================
    // DEFAULT USER DATA
    // ==============================
    if (typeof user.sword !== 'number') user.sword = 0
    if (typeof user.armor !== 'number') user.armor = 0
    if (typeof user.healt !== 'number') user.healt = 0
    if (typeof user.sworddurability !== 'number') user.sworddurability = 0

    // ==============================
    // CEK ITEM
    // ==============================
    const SWORD = user.sword < 1
    const ARMOR = user.armor < 1
    const HEALT = user.healt < 90

    if (SWORD || ARMOR || HEALT) {

        if (SWORD) {
            const caption =
                `${usedPrefix}shop buy sword\n\nUntuk membeli pedang kamu!`

            return conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg'
                    },
                    caption,
                    mentions: [m.sender]
                },
                { quoted: m }
            )
        }

        if (ARMOR) {
            const caption =
                `${usedPrefix}shop buy armor\n\nUntuk membeli armor kamu!`

            return conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg'
                    },
                    caption,
                    mentions: [m.sender]
                },
                { quoted: m }
            )
        }

        if (HEALT) {
            const caption =
                `${usedPrefix}heal\n\nUntuk menambah darah kamu!`

            return conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg'
                    },
                    caption,
                    mentions: [m.sender]
                },
                { quoted: m }
            )
        }
    }

    // ==============================
    // DUNGEON DATABASE
    // ==============================
    global.dungeon = global.dungeon || {}

    // ==============================
    // CEK SUDAH ADA DI DUNGEON
    // ==============================
    const currentRoom = Object.values(global.dungeon).find(room =>
        room &&
        room.id &&
        room.id.startsWith('dungeon-') &&
        room.game &&
        [
            room.game.player1,
            room.game.player2,
            room.game.player3,
            room.game.player4
        ].includes(m.sender)
    )

    if (currentRoom) {
        throw 'Kamu masih di dalam Dungeon.'
    }

    // ==============================
    // COOLDOWN
    // ==============================
    const now = Date.now()
    const lastDungeon = Number(user.lastdungeon || 0)

    const timing = now - lastDungeon

    if (timing < 100) {
        throw `Silahkan tunggu ${clockString(100 - timing)} untuk bisa ke Dungeon.`
    }

    // ==============================
    // CARI ROOM
    // ==============================
    let room = Object.values(global.dungeon).find(room =>
        room &&
        room.state === 'WAITING' &&
        (text ? room.name === text : true)
    )

    // ==========================================================
    // JOIN ROOM YANG SUDAH ADA
    // ==========================================================
    if (room) {

        const p1 = room.game.player1 || ''
        const p2 = room.game.player2 || ''
        const p3 = room.game.player3 || ''
        const p4 = room.game.player4 || ''

        // ==============================
        // MASUKKAN PLAYER
        // ==============================
        if (!p2) {
            room.player2 = m.chat
            room.game.player2 = m.sender
        } else if (!p3) {
            room.player3 = m.chat
            room.game.player3 = m.sender
        } else if (!p4) {
            room.player4 = m.chat
            room.game.player4 = m.sender
            room.state = 'PLAYING'
        }

        const players = [
            room.game.player1,
            room.game.player2,
            room.game.player3,
            room.game.player4
        ].filter(Boolean)

        const chats = [
            room.player1,
            room.player2,
            room.player3,
            room.player4
        ].filter(Boolean)

        const waitingText =
            room.game.player4
                ? 'Semua partner telah lengkap...'
                : `Menunggu ${4 - players.length} Partner lagi... ${
                    room.name
                        ? `mengetik command dibawah ini *${usedPrefix}${command} ${room.name}*`
                        : ''
                }`

        await conn.sendMessage(
            m.chat,
            {
                image: {
                    url: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg'
                },
                caption: waitingText,
                mentions: [m.sender]
            },
            { quoted: m }
        )

        // ==============================
        // ROOM PENUH
        // ==============================
        if (
            room.game.player1 &&
            room.game.player2 &&
            room.game.player3 &&
            room.game.player4
        ) {

            // ==============================
            // TAMBAHAN REWARD PARTY
            // ==============================
            room.price.money += Math.floor(Math.random() * 1000001)
            room.price.exp += Math.floor(Math.random() * 500001)

            room.price.iron += pickRandom([
                0, 0, 0, 0, 1, 0, 0, 0
            ])

            room.price.diamond += pickRandom([
                0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                0, 0, 0, 0, 0
            ])

            room.price.sampah += Math.floor(Math.random() * 101)
            room.price.string += Math.floor(Math.random() * 2)
            room.price.kayu += Math.floor(Math.random() * 2)
            room.price.batu += Math.floor(Math.random() * 2)

            room.price.makananPet += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0
            ])

            room.price.common += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ])

            room.price.uncommon += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ])

            // ==============================
            // INFO BATTLE
            // ==============================
            const str =
                `Room ID: ${room.id}\n\n` +
                `${players.map(M).join(', ')}\n\n` +
                `Sedang berperang di dungeon...`

            await sendToPlayers(
                conn,
                chats,
                str,
                m
            )

            // ==============================
            // TUNGGU BATTLE
            // ==============================
            await sleep(randomBattleDelay())

            // ==============================
            // SELESAIKAN DUNGEON
            // ==============================
            await finishMultiplayerDungeon(
                conn,
                room,
                players,
                chats,
                usedPrefix,
                m
            )

            delete global.dungeon[room.id]

            return
        }

        return
    }

    // ==========================================================
    // BUAT ROOM BARU
    // ==========================================================
    room = {
        id: 'dungeon-' + Date.now(),

        player1: m.chat,
        player2: '',
        player3: '',
        player4: '',

        state: 'WAITING',

        game: {
            player1: m.sender,
            player2: '',
            player3: '',
            player4: ''
        },

        price: {
            money: Math.floor(Math.random() * 500001),
            exp: Math.floor(Math.random() * 70001),
            sampah: Math.floor(Math.random() * 201),
            potion: Math.floor(Math.random() * 2),

            diamond: pickRandom([
                0, 0, 0, 0, 1, 0, 0
            ]),

            iron: Math.floor(Math.random() * 2),
            kayu: Math.floor(Math.random() * 3),
            batu: Math.floor(Math.random() * 2),
            string: Math.floor(Math.random() * 2),

            common: pickRandom([
                0, 0, 0, 1, 0, 0
            ]),

            uncommon: pickRandom([
                0, 0, 0, 1, 0, 0, 0
            ]),

            mythic: pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0
            ]),

            legendary: pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0
            ]),

            pet: pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ]),

            makananPet: pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0
            ])
        },

        less: {
            healt: Math.floor(Math.random() * 101),
            sword: Math.floor(Math.random() * 50)
        }
    }

    if (text) {
        room.name = text
    }

    global.dungeon[room.id] = room

    const caption =
        'Menunggu partner ' +
        (
            text
                ? `mengetik command dibawah ini\n${usedPrefix}${command} ${text}`
                : ''
        ) +
        '\natau ketik *sendiri* untuk bermain sendiri'

    await conn.sendMessage(
        m.chat,
        {
            image: {
                url: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg'
            },
            caption,
            mentions: [m.sender]
        },
        { quoted: m }
    )
}

// ==========================================================
// BEFORE HANDLER
// ==========================================================
handler.before = async function (m) {

    global.dungeon = global.dungeon || {}

    const room = Object.values(global.dungeon).find(room =>
        room &&
        room.id &&
        room.id.startsWith('dungeon-') &&
        room.game &&
        [
            room.game.player1,
            room.game.player2,
            room.game.player3,
            room.game.player4
        ].includes(m.sender) &&
        room.state === 'WAITING'
    )

    if (!room) {
        return
    }

    const p1 = room.game.player1 || ''
    const p2 = room.game.player2 || ''
    const p3 = room.game.player3 || ''
    const p4 = room.game.player4 || ''

    const c1 = room.player1 || ''
    const c2 = room.player2 || ''
    const c3 = room.player3 || ''
    const c4 = room.player4 || ''

    const players = [
        p1,
        p2,
        p3,
        p4
    ].filter(Boolean)

    const chats = [
        c1,
        c2,
        c3,
        c4
    ].filter(Boolean)

    const P = data(players)

    // ======================================================
    // MAIN PLAYER MENCOBA BERMAIN SENDIRI
    // ======================================================
    if (/^(sendiri|dewean|solo)$/i.test(String(m.text || '').toLowerCase())) {

        if (players.length > 1) {
            const lmao =
                'Kamu tidak bisa bermain sendiri karena memiliki partner. ' +
                'Silahkan ketik *gass* untuk bermain dengan partner lainnya...'

            await this.sendMessage(
                m.chat,
                {
                    image: {
                        url: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg'
                    },
                    caption: lmao,
                    mentions: [m.sender]
                },
                { quoted: m }
            )

            return
        }

        room.state = 'PLAYING'

        const str =
            `Room ID: ${room.id}\n\n` +
            `${P}\n\n` +
            `Sedang berperang di dungeon...`

        await sendToPlayers(
            this,
            [c1],
            str,
            m
        )

        await sleep(randomBattleDelay())

        await finishSoloDungeon(
            this,
            room,
            p1,
            c1,
            m,
            m
        )

        delete global.dungeon[room.id]

        return
    }

    // ======================================================
    // MULAI DUNGEON
    // ======================================================
    if (/^(gass?s?s?s?.?.?.?|mulai|los?s?s?.?.?.?)$/i.test(
        String(m.text || '').toLowerCase()
    )) {

        room.state = 'PLAYING'

        const str =
            `Room ID: ${room.id}\n\n` +
            `${P}\n\n` +
            `Sedang berperang di dungeon...`

        await sendToPlayers(
            this,
            chats,
            str,
            m
        )

        // ==================================================
        // TAMBAHAN REWARD BERDASARKAN JUMLAH PLAYER
        // ==================================================
        for (let i = 0; i < players.length; i++) {

            room.price.money += Math.floor(Math.random() * 41)
            room.price.exp += Math.floor(Math.random() * 76)
            room.price.sampah += Math.floor(Math.random() * 16)

            room.price.string += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ])

            room.price.kayu += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ])

            room.price.batu += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ])

            room.price.common += pickRandom([
                0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0
            ])
        }

        await sleep(randomBattleDelay())

        await finishMultiplayerDungeon(
            this,
            room,
            players,
            chats,
            this.prefix || '',
            m
        )

        delete global.dungeon[room.id]

        return
    }
}

// ==========================================================
// HANDLER CONFIG
// ==========================================================
handler.help = ['dungeon *[nama room]*']
handler.tags = ['rpg']
handler.command = /^(dungeon)$/i

handler.rpg = true
handler.mods = false

// LIMIT DIHAPUS SEPENUHNYA
// Jangan gunakan handler.limit di plugin ini.
// Loader tidak akan diberi konfigurasi limit dari plugin.

export default handler

// ==========================================================
// FINISH MULTIPLAYER
// ==========================================================
async function finishMultiplayerDungeon(
    conn,
    room,
    players,
    chats,
    usedPrefix,
    m
) {

    const users = global.db.data.users

    const lessHealth = Number(room.less.healt || 0)
    const lessSword = Number(room.less.sword || 0)

    const reward = room.price

    const enemy = pickRandom([
        'Ender Dragon',
        'Baby Dragon',
        'Titan',
        'Cacing dan Semut',
        'PP Mikey',
        'Orang',
        'Kecoa',
        'Semut',
        'Siput',
        '....',
        'Wither',
        'Sekeleton',
        'Ayam Emas',
        'Temenmu',
        'Sapi',
        'Tidak Ada',
        'Creeper',
        'Zombie',
        'Hewan Pelihraanmu',
        'Diri Sendiri'
    ])

    const orang = players.length

    const str2 =
        `Nyawa ${data(players)} masing masing berkurang *-${lessHealth}*, ` +
        `dan durability Sword kalian masing masing berkurang *-${lessSword}* ` +
        `karena kalian telah membunuh *${enemy}* dan mendapatkan total\n` +
        `*Exp:* ${reward.exp * orang}\n` +
        `*Uang:* ${reward.money * orang}\n` +
        `*Sampah:* ${reward.sampah * orang}` +
        `${reward.potion === 0 ? '' : '\n*Potion:* ' + reward.potion * orang}` +
        `${reward.makananPet === 0 ? '' : '\n*Makanan Pet:* ' + reward.makananPet * orang}` +
        `${reward.kayu === 0 ? '' : '\n*Kayu:* ' + reward.kayu * orang}` +
        `${reward.batu === 0 ? '' : '\n*Batu:* ' + reward.batu * orang}` +
        `${reward.string === 0 ? '' : '\n*String:* ' + reward.string * orang}` +
        `${reward.iron === 0 ? '' : '\n*Iron:* ' + reward.iron * orang}` +
        `${reward.diamond === 0 ? '' : '\n*Diamond:* ' + reward.diamond * orang}` +
        `${reward.common === 0 ? '' : '\n*Common Crate:* ' + reward.common * orang}` +
        `${reward.uncommon === 0 ? '' : '\n*Uncommon Crate:* ' + reward.uncommon * orang}`

    // ======================================================
    // BAGIKAN REWARD KE SETIAP PLAYER
    // ======================================================
    for (const jid of players) {

        const player = users[jid]

        if (!player) {
            continue
        }

        if (typeof player.healt !== 'number') player.healt = 0
        if (typeof player.sworddurability !== 'number') player.sworddurability = 0
        if (typeof player.sword !== 'number') player.sword = 0

        if (typeof player.money !== 'number') player.money = 0
        if (typeof player.exp !== 'number') player.exp = 0
        if (typeof player.sampah !== 'number') player.sampah = 0
        if (typeof player.potion !== 'number') player.potion = 0
        if (typeof player.diamond !== 'number') player.diamond = 0
        if (typeof player.iron !== 'number') player.iron = 0
        if (typeof player.kayu !== 'number') player.kayu = 0
        if (typeof player.batu !== 'number') player.batu = 0
        if (typeof player.string !== 'number') player.string = 0
        if (typeof player.common !== 'number') player.common = 0
        if (typeof player.uncommon !== 'number') player.uncommon = 0
        if (typeof player.mythic !== 'number') player.mythic = 0
        if (typeof player.legendary !== 'number') player.legendary = 0
        if (typeof player.pet !== 'number') player.pet = 0
        if (typeof player.makananpet !== 'number') player.makananpet = 0

        // ==============================
        // DAMAGE
        // ==============================
        player.healt -= lessHealth
        player.sworddurability -= lessSword

        // ==============================
        // REWARD
        // ==============================
        player.money += Number(reward.money || 0)
        player.exp += Number(reward.exp || 0)
        player.sampah += Number(reward.sampah || 0)
        player.potion += Number(reward.potion || 0)
        player.diamond += Number(reward.diamond || 0)
        player.iron += Number(reward.iron || 0)
        player.kayu += Number(reward.kayu || 0)
        player.batu += Number(reward.batu || 0)
        player.string += Number(reward.string || 0)
        player.common += Number(reward.common || 0)
        player.uncommon += Number(reward.uncommon || 0)
        player.mythic += Number(reward.mythic || 0)
        player.legendary += Number(reward.legendary || 0)
        player.pet += Number(reward.pet || 0)
        player.makananpet += Number(reward.makananPet || 0)

        player.lastdungeon = Date.now()

        // ==============================
        // HEALTH MINIMUM
        // ==============================
        if (player.healt < 1) {
            player.healt = 0
        }

        // ==============================
        // SWORD DURABILITY
        // ==============================
        if (player.sworddurability < 1) {

            if (player.sword > 0) {
                player.sword -= 1
            }

            if (player.sword > 0) {
                player.sworddurability = player.sword * 50
            } else {
                player.sworddurability = 0
            }
        }
    }

    // ======================================================
    // KIRIM HASIL
    // ======================================================
    await sendToPlayers(
        conn,
        chats,
        str2,
        m
    )

    // ======================================================
    // MYTHIC
    // ======================================================
    if (Number(reward.mythic || 0) > 0) {

        const str3 =
            `Selamat ${data(players)} kalian mendapatkan item Rare ` +
            `Total *${reward.mythic * orang}* 📦 Mythic Crate`

        await sendToPlayers(
            conn,
            chats,
            str3,
            m
        )
    }

    // ======================================================
    // LEGENDARY / PET
    // ======================================================
    if (
        Number(reward.legendary || 0) > 0 ||
        Number(reward.pet || 0) > 0
    ) {

        let rewardText = ''

        if (
            reward.pet > 0 &&
            reward.legendary > 0
        ) {
            rewardText =
                `*${reward.legendary * orang}* 🎁Legendary Crate ` +
                `dan *${reward.pet * orang}* 📦Pet Crate`
        } else if (reward.pet > 0) {
            rewardText =
                `*${reward.pet * orang}* 📦Pet Crate`
        } else {
            rewardText =
                `*${reward.legendary * orang}* 🎁Legendary Crate`
        }

        const str3 =
            `${reward.mythic > 0 ? 'Dan juga' : 'Selamat ' + data(players) + ' kalian'} ` +
            `mendapatkan item Epic Total ${rewardText}`

        await sendToPlayers(
            conn,
            chats,
            str3,
            m
        )
    }

    // ======================================================
    // PERINGATAN HEALTH / SWORD
    // ======================================================
    const healthEmpty = []
    const swordBroken = []
    const swordLevelDown = []

    for (const jid of players) {

        const player = users[jid]

        if (!player) continue

        if (Number(player.healt || 0) < 1) {
            healthEmpty.push(jid)
        }

        if (
            Number(player.sworddurability || 0) < 1 &&
            Number(player.sword || 0) === 1
        ) {
            swordBroken.push(jid)
        }

        if (
            Number(player.sworddurability || 0) < 1 &&
            Number(player.sword || 0) > 1
        ) {
            swordLevelDown.push(jid)
        }
    }

    let warning = ''

    if (swordBroken.length > 0) {
        warning +=
            `⚔️ Sword ${data(swordBroken)} hancur, ` +
            `silahkan crafting ⚔️Sword kembali dengan mengetik ` +
            `*${usedPrefix}craft sword*`
    }

    if (swordLevelDown.length > 0) {
        if (warning) warning += '\n'

        warning +=
            `⚔️ Sword ${data(swordLevelDown)} hancur dan ` +
            `menurun *1* level`
    }

    if (healthEmpty.length > 0) {
        if (warning) warning += '\n'

        warning +=
            `❤️ Nyawa ${data(healthEmpty)} habis, ` +
            `silahkan isi ❤️Nyawa dengan mengetik ` +
            `*${usedPrefix}heal*`
    }

    if (warning) {
        await sendToPlayers(
            conn,
            chats,
            warning,
            m
        )
    }
}

// ==========================================================
// FINISH SOLO
// ==========================================================
async function finishSoloDungeon(
    conn,
    room,
    playerJid,
    chat,
    m,
    originalMessage
) {

    const users = global.db.data.users
    const user = users[playerJid]

    if (!user) {
        throw '❌ Data user dungeon tidak ditemukan.'
    }

    const lessHealth = Number(room.less.healt || 0)
    const lessSword = Number(room.less.sword || 0)
    const reward = room.price

    const enemy = pickRandom([
        'Ender Dragon',
        'Baby Dragon',
        'Titan',
        'Cacing dan Semut',
        'PP Mikey',
        'Orang',
        'Kecoa',
        'Semut',
        'Siput',
        '....',
        'Wither',
        'Sekeleton',
        'Ayam Emas',
        'Temenmu',
        'Sapi',
        'Tidak Ada',
        'Creeper',
        'Zombie',
        'Hewan Pelihraanmu',
        'Diri Sendiri'
    ])

    const str2 =
        `Nyawa Kamu berkurang *-${lessHealth}*, ` +
        `dan durability Sword Kamu *-${lessSword}* ` +
        `karena kamu telah membunuh *${enemy}* dan mendapatkan\n` +
        `*Exp:* ${reward.exp}\n` +
        `*Uang:* ${reward.money}\n` +
        `*Sampah:* ${reward.sampah}` +
        `${reward.potion === 0 ? '' : '\n*Potion:* ' + reward.potion}` +
        `${reward.makananPet === 0 ? '' : '\n*Makanan Pet:* ' + reward.makananPet}` +
        `${reward.kayu === 0 ? '' : '\n*Kayu:* ' + reward.kayu}` +
        `${reward.batu === 0 ? '' : '\n*Batu:* ' + reward.batu}` +
        `${reward.string === 0 ? '' : '\n*String:* ' + reward.string}` +
        `${reward.iron === 0 ? '' : '\n*Iron:* ' + reward.iron}` +
        `${reward.diamond === 0 ? '' : '\n*Diamond:* ' + reward.diamond}` +
        `${reward.common === 0 ? '' : '\n*Common Crate:* ' + reward.common}` +
        `${reward.uncommon === 0 ? '' : '\n*Uncommon Crate:* ' + reward.uncommon}`

    // ==============================
    // DAMAGE
    // ==============================
    user.healt -= lessHealth
    user.sworddurability -= lessSword

    // ==============================
    // REWARD
    // ==============================
    user.money = Number(user.money || 0) + Number(reward.money || 0)
    user.exp = Number(user.exp || 0) + Number(reward.exp || 0)
    user.sampah = Number(user.sampah || 0) + Number(reward.sampah || 0)
    user.potion = Number(user.potion || 0) + Number(reward.potion || 0)
    user.diamond = Number(user.diamond || 0) + Number(reward.diamond || 0)
    user.iron = Number(user.iron || 0) + Number(reward.iron || 0)
    user.kayu = Number(user.kayu || 0) + Number(reward.kayu || 0)
    user.batu = Number(user.batu || 0) + Number(reward.batu || 0)
    user.string = Number(user.string || 0) + Number(reward.string || 0)
    user.common = Number(user.common || 0) + Number(reward.common || 0)
    user.uncommon = Number(user.uncommon || 0) + Number(reward.uncommon || 0)
    user.mythic = Number(user.mythic || 0) + Number(reward.mythic || 0)
    user.legendary = Number(user.legendary || 0) + Number(reward.legendary || 0)
    user.pet = Number(user.pet || 0) + Number(reward.pet || 0)
    user.makananpet = Number(user.makananpet || 0) + Number(reward.makananPet || 0)

    user.lastdungeon = Date.now()

    if (user.healt < 1) {
        user.healt = 0
    }

    if (user.sworddurability < 1) {

        if (user.sword > 0) {
            user.sword -= 1
        }

        if (user.sword > 0) {
            user.sworddurability = user.sword * 50
        } else {
            user.sworddurability = 0
        }
    }

    // ==============================
    // KIRIM HASIL
    // ==============================
    await conn.sendMessage(
        chat,
        {
            text: str2
        },
        { quoted: originalMessage }
    )

    // ==============================
    // MYTHIC
    // ==============================
    if (reward.mythic > 0) {

        await conn.sendMessage(
            chat,
            {
                text:
                    `Selamat Kamu Mendapatkan item Rare yaitu ` +
                    `*${reward.mythic}* Mythic Crate`
            },
            { quoted: originalMessage }
        )
    }

    // ==============================
    // LEGENDARY / PET
    // ==============================
    if (
        reward.legendary > 0 ||
        reward.pet > 0
    ) {

        let rewardText = ''

        if (
            reward.pet > 0 &&
            reward.legendary > 0
        ) {
            rewardText =
                `*${reward.legendary}* Legendary Crate ` +
                `dan *${reward.pet}* Pet Crate`
        } else if (reward.pet > 0) {
            rewardText =
                `*${reward.pet}* Pet Crate`
        } else {
            rewardText =
                `*${reward.legendary}* Legendary Crate`
        }

        await conn.sendMessage(
            chat,
            {
                text:
                    `${reward.mythic > 0 ? 'Dan juga' : 'Selamat Kamu'} ` +
                    `mendapatkan item Epic yaitu ${rewardText}`
            },
            { quoted: originalMessage }
        )
    }

    // ==============================
    // PERINGATAN
    // ==============================
    let warning = ''

    if (
        user.sworddurability < 1 &&
        user.sword === 1
    ) {
        warning +=
            `⚔️ Sword Kamu hancur, silahkan crafting ` +
            `Sword kembali dengan mengetik *craft sword*`
    } else if (
        user.sworddurability < 1 &&
        user.sword > 1
    ) {
        warning +=
            `⚔️ Sword Kamu hancur dan levelnya berkurang 1`
    }

    if (user.healt < 1) {
        if (warning) warning += '\n'

        warning +=
            `❤️ Nyawa Kamu habis, silahkan isi kembali ` +
            `dengan mengetik *${m.prefix || ''}heal*`
    }

    if (warning) {
        await conn.sendMessage(
            chat,
            {
                text: warning
            },
            { quoted: originalMessage }
        )
    }
}

// ==========================================================
// SEND MESSAGE KE SEMUA PLAYER
// ==========================================================
async function sendToPlayers(conn, chats, text, quoted) {

    for (const chat of chats) {

        if (!chat) continue

        await conn.sendMessage(
            chat,
            {
                text,
                mentions: conn.parseMention(text)
            },
            { quoted }
        )
    }
}

// ==========================================================
// SLEEP
// ==========================================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// ==========================================================
// RANDOM BATTLE DELAY
// ==========================================================
function randomBattleDelay() {

    const values = [
        1000,
        2000,
        3000,
        4000,
        5000,
        6000,
        7000,
        8000,
        9000,
        10000,
        11000
    ]

    return pickRandom(values)
}

// ==========================================================
// PICK RANDOM
// ==========================================================
function pickRandom(list) {
    return list[
        Math.floor(Math.random() * list.length)
    ]
}

// ==========================================================
// FORMAT PLAYER
// ==========================================================
function M(jid) {

    if (!jid) {
        return ''
    }

    return '@' + jid.split('@')[0]
}

// ==========================================================
// FORMAT PLAYER LIST
// ==========================================================
function data(DATA) {

    const list = Array.isArray(DATA)
        ? DATA.filter(Boolean)
        : []

    if (list.length === 0) {
        return ''
    }

    if (list.length === 1) {
        return `*${M(list[0])}*`
    }

    if (list.length === 2) {
        return `*${M(list[0])}* dan *${M(list[1])}*`
    }

    const last = list[list.length - 1]

    return (
        list
            .slice(0, -1)
            .map(player => `*${M(player)}*`)
            .join(', ') +
        ` dan *${M(last)}*`
    )
}

// ==========================================================
// CLOCK
// ==========================================================
function clockString(ms) {

    const h = Math.floor(ms / 3600000)
    const m = Math.floor(ms / 60000) % 60
    const s = Math.floor(ms / 1000) % 60

    return [
        h,
        m,
        s
    ]
        .map(v => String(v).padStart(2, '0'))
        .join(':')
}

// ==========================================================
// ITEM MESSAGE
// ==========================================================
function item(sword, armor, healt, usedPrefix) {

    const sw = Number(sword || 0) < 1
    const a = Number(armor || 0) < 1
    const h = Number(healt || 0) < 90

    let str = ''

    if (sw) {
        str +=
            `Kamu belum memiliki ⚔️Sword\n` +
            `untuk mendapatkan ⚔Sword ketik ` +
            `*${usedPrefix}craft sword*\n`
    }

    if (a) {
        str +=
            `Kamu belum memiliki 🥼Armor\n` +
            `untuk mendapatkan 🥼Armor ketik ` +
            `*${usedPrefix}shop buy armor*\n`
    }

    if (h) {
        str +=
            `Minimal 90 ❤️Healt\n` +
            `untuk menambah ❤️Healt ketik ` +
            `*${usedPrefix}heal*`
    }

    return str.trim()
}