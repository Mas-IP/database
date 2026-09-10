//create code Wonge-bot

const __dirname = import.meta.dirname;
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
import levelling from '../lib/levelling.js'

let arrayMenu = [
  'all', 
  'ai', 
  'main', 
  'downloader', 
  'database', 
  'rpg',
  'rpgG', 
  'sticker', 
  'advanced', 
  'xp', 
  'fun', 
  'game', 
  'github', 
  'group', 
  'image', 
  'nsfw', 
  'info', 
  'internet', 
  'islam', 
  'kerang', 
  'maker', 
  'news', 
  'owner', 
  'voice', 
  'quotes', 
  'store', 
  'stalk', 
  'shortlink', 
  'tools', 
  'anonymous',
  ''
];

const allTags = {
    'all': 'SEMUA MENU',
    'ai': 'MENU AI',
    'downloader': 'MENU DOWNLOADER',
    'database': 'MENU DATABASE',
    'rpg': 'MENU RPG',
    'rpgG': 'MENU RPG GUILD',
    'sticker': 'MENU CONVERT',
    'advanced': 'ADVANCED',
    'xp': 'MENU EXP',
    'fun': 'MENU FUN',
    'game': 'MENU GAME',
    'github': 'MENU GITHUB',
    'group': 'MENU GROUP',
    'image': 'MENU IMAGE',
    'nsfw': 'MENU NSFW',
    'info': 'MENU INFO',
    'internet': 'INTERNET',
    'islam': 'MENU ISLAMI',
    'kerang': 'MENU KERANG',
    'maker': 'MENU MAKER',
    'news': 'MENU NEWS',
    'owner': 'MENU OWNER',
    'voice': 'PENGUBAH SUARA',
    'quotes': 'MENU QUOTES',
    'store': 'MENU STORE',
    'stalk': 'MENU STALK',
    'shortlink': 'SHORT LINK',
    'tools': 'MENU TOOLS',
    'anonymous': 'MENU ANONYMOUS',
    '': 'NO CATEGORY'
}

const defaultMenu = {
    before: `
Hii %name
Saya adalah 𝐖𝐎𝐍𝐆-𝐁𝟎𝐓

┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time
│  ◦ Time UTC : %utcTime
└  ◦ Prefix Used : *[ %p ]*
`.trimStart(),
    header: '┌  ◦ *%category*',
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `*Note:* Ketik .menu <category> untuk melihat menu spesifik\nContoh: .menu tools`
}

let handler = async (m, { conn, usedPrefix: _p, args = [], command }) => {
    try {
        // Safelist database
        global.db = global.db || {}
        global.db.data = global.db.data || {}
        global.db.data.users = global.db.data.users || {}
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
            exp: 0,
            limit: 0,
            level: 0,
            role: 'Member'
        }

        let pkg = JSON.parse(
            await fs.promises
                .readFile(path.join(__dirname, '../package.json'))
                .catch(_ => '{}')
        )

        let { exp, limit, level, role } = global.db.data.users[m.sender]

        let { min, xp, max } = levelling.xpRange(
            level,
            global.multiplier
        )

        let name = `@${m.sender.split('@')[0]}`
        let teks = args[0] || ''

        let d = new Date(new Date + 3600000)
        let locale = 'id'

        let date = d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })

        let time = d.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })

        // Waktu UTC +00:00
        let utcTime = new Date().toISOString().slice(11, 19)

        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)

        let help = Object.values(global.plugins)
            .filter(plugin => !plugin.disabled)
            .map(plugin => {
                return {
                    help: Array.isArray(plugin.help)
                        ? plugin.help
                        : [plugin.help],

                    tags: Array.isArray(plugin.tags)
                        ? plugin.tags
                        : [plugin.tags],

                    prefix: 'customPrefix' in plugin,
                    limit: plugin.limit,
                    premium: plugin.premium,
                    enabled: !plugin.disabled,
                }
            })

        // Atur fallback gambar
        let imgMenu =
            global.menuImage ||
            global.thumb ||
            "https://telegra.ph/file/3a34bfa58714bdef500d9.jpg"

        if (!teks) {
            let menuList = `${defaultMenu.before}\n\n┌  ◦ *DAFTAR MENU*\n`

            for (let tag of arrayMenu) {
                if (tag && allTags[tag]) {
                    menuList += `│  ◦ ${_p}menu ${tag}\n`
                }
            }

            menuList += `└  \n\n${defaultMenu.after}`

            let replace = {
                '%': '%',
                p: _p,
                uptime,
                name,
                date,
                time,
                utcTime
            }

            let text = menuList.replace(
                new RegExp(
                    `%(${Object.keys(replace)
                        .sort((a, b) => b.length - a.length)
                        .join`|`})`,
                    'g'
                ),
                (_, name) => '' + replace[name]
            )

            // Kirim Gambar Menu
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: imgMenu },
                    caption: text,
                    mentions: [m.sender]
                },
                { quoted: m }
            )

            // Kirim Audio jika ada
            if (global.menuAudio) {
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: { url: global.menuAudio },
                        mimetype: 'audio/mpeg',
                        ptt: true
                    },
                    { quoted: m }
                )
            }

            return
        }

        if (!allTags[teks]) {
            return m.reply(
                `Menu "${teks}" tidak tersedia.\nSilakan ketik ${_p}menu untuk melihat daftar menu.`
            )
        }

        let menuCategory = defaultMenu.before + '\n\n'

        if (teks === 'all') {
            // category all
            for (let tag of arrayMenu) {
                if (tag !== 'all' && allTags[tag]) {
                    menuCategory +=
                        defaultMenu.header.replace(
                            /%category/g,
                            allTags[tag]
                        ) + '\n'

                    let categoryCommands = help.filter(
                        menu =>
                            menu.tags &&
                            menu.tags.includes(tag) &&
                            menu.help
                    )

                    for (let menu of categoryCommands) {
                        for (let help of menu.help) {
                            menuCategory +=
                                defaultMenu.body
                                    .replace(
                                        /%cmd/g,
                                        menu.prefix
                                            ? help
                                            : _p + help
                                    )
                                    .replace(
                                        /%islimit/g,
                                        menu.limit ? '(Ⓛ)' : ''
                                    )
                                    .replace(
                                        /%isPremium/g,
                                        menu.premium ? '(Ⓟ)' : ''
                                    ) + '\n'
                        }
                    }

                    menuCategory += defaultMenu.footer + '\n'
                }
            }
        } else {
            menuCategory +=
                defaultMenu.header.replace(
                    /%category/g,
                    allTags[teks]
                ) + '\n'

            let categoryCommands = help.filter(
                menu =>
                    menu.tags &&
                    menu.tags.includes(teks) &&
                    menu.help
            )

            for (let menu of categoryCommands) {
                for (let help of menu.help) {
                    menuCategory +=
                        defaultMenu.body
                            .replace(
                                /%cmd/g,
                                menu.prefix
                                    ? help
                                    : _p + help
                            )
                            .replace(
                                /%islimit/g,
                                menu.limit ? '(Ⓛ)' : ''
                            )
                            .replace(
                                /%isPremium/g,
                                menu.premium ? '(Ⓟ)' : ''
                            ) + '\n'
                }
            }

            menuCategory += defaultMenu.footer + '\n'
        }

        menuCategory += '\n' + defaultMenu.after

        let replace = {
            '%': '%',
            p: _p,
            uptime,
            name,
            date,
            time,
            utcTime
        }

        let text = menuCategory.replace(
            new RegExp(
                `%(${Object.keys(replace)
                    .sort((a, b) => b.length - a.length)
                    .join`|`})`,
                'g'
            ),
            (_, name) => '' + replace[name]
        )

        // Kirim Gambar Menu Category
        await conn.sendMessage(
            m.chat,
            {
                image: { url: imgMenu },
                caption: text,
                mentions: [m.sender]
            },
            { quoted: m }
        )

        // Kirim Audio jika ada
        if (global.menuAudio) {
            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: global.menuAudio },
                    mimetype: 'audio/mpeg',
                    ptt: true
                },
                { quoted: m }
            )
        }

    } catch (e) {
        conn.reply(m.chat, 'Maaf, menu sedang error', m)
        console.error(e)
    }
}

handler.help = ['menu']
handler.tags = ['tools']
handler.command = /^(menu|help)$/i
handler.exp = 3

export default handler

function clockString(ms) {
    if (isNaN(ms)) return '--'

    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60

    return [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}