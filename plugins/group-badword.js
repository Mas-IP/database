//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname

process.env.TZ = 'Asia/Makassar'

const DBFILE = path.join(
    __dirname,
    '..',
    'database',
    'katakasars.json'
)

const COOLDOWN_KEY = '__KKS_COOL'
const CACHE_KEY = '__KKS_BADWORD_CACHE'

// ==============================
// DEFAULT DATABASE
// ==============================
function defaultDatabase() {
    return {
        on: true,
        cooldown: 30,
        bypassAdmins: true,
        list: [
            'kontol',
            'memek',
            'pepek',
            'anjing',
            'bangsat',
            'ngentot',
            'peler',
            'tolol',
            'goblok',
            'bajingan',
            'lonte',
            'pelacur',
            'fuck',
            'shit',
            'bitch',
            'asshole',
            'motherfucker',
            'pussy',
            'dick',
            'cock',
            'slut',
            'whore'
        ]
    }
}

// ==============================
// NORMALIZE
// ==============================
function norm(text) {
    if (
        text === undefined ||
        text === null
    ) {
        return ''
    }

    return String(text)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .toLowerCase()
        .trim()
}

// ==============================
// COMPACT TEXT
// ==============================
function compactText(text) {
    return norm(text)
        .replace(/[^a-z0-9]/g, '')
}

// ==============================
// ESCAPE REGEX
// ==============================
function escapeRegex(str) {
    return String(str).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    )
}

// ==============================
// LOAD DATABASE
// ==============================
function loadCfg() {
    try {
        fs.mkdirSync(
            path.dirname(DBFILE),
            {
                recursive: true
            }
        )

        if (!fs.existsSync(DBFILE)) {
            const cfg = defaultDatabase()
            saveCfg(cfg)
            return cfg
        }

        const raw =
            fs.readFileSync(
                DBFILE,
                'utf8'
            ).trim()

        if (!raw) {
            const cfg = defaultDatabase()
            saveCfg(cfg)
            return cfg
        }

        const data =
            JSON.parse(raw)

        if (
            typeof data !== 'object' ||
            data === null ||
            Array.isArray(data)
        ) {
            const cfg = defaultDatabase()
            saveCfg(cfg)
            return cfg
        }

        if (
            typeof data.on !== 'boolean'
        ) {
            data.on = true
        }

        if (
            typeof data.cooldown !== 'number' ||
            !isFinite(data.cooldown) ||
            data.cooldown < 0
        ) {
            data.cooldown = 30
        }

        if (
            typeof data.bypassAdmins !==
            'boolean'
        ) {
            data.bypassAdmins = true
        }

        if (!Array.isArray(data.list)) {
            data.list = []
        }

        // ==============================
        // CLEAN DATABASE
        // ==============================
        const clean = []
        const used = {}

        for (
            const value of data.list
        ) {
            if (
                typeof value !==
                'string'
            ) {
                continue
            }

            const word =
                value.trim()

            if (!word) {
                continue
            }

            const key =
                norm(word)

            if (!key) {
                continue
            }

            if (used[key]) {
                continue
            }

            used[key] = true
            clean.push(word)
        }

        data.list = clean

        return data

    } catch (e) {
        console.error(
            '[BADWORD DATABASE]',
            e.message
        )

        const cfg =
            defaultDatabase()

        try {
            saveCfg(cfg)
        } catch (err) {}

        return cfg
    }
}

// ==============================
// SAVE DATABASE
// ==============================
function saveCfg(cfg) {
    try {
        fs.mkdirSync(
            path.dirname(DBFILE),
            {
                recursive: true
            }
        )

        fs.writeFileSync(
            DBFILE,
            JSON.stringify(
                cfg,
                null,
                2
            ),
            'utf8'
        )

        global[CACHE_KEY] = null

        return true

    } catch (e) {
        console.error(
            '[BADWORD SAVE]',
            e.message
        )

        return false
    }
}

// ==============================
// GET TEXT
// ==============================
function getText(m) {
    if (!m) {
        return ''
    }

    try {
        if (m.text) {
            return String(m.text)
        }

        if (m.caption) {
            return String(m.caption)
        }

        if (m.body) {
            return String(m.body)
        }

        const message =
            m.message || {}

        if (
            message.conversation
        ) {
            return String(
                message.conversation
            )
        }

        if (
            message.extendedTextMessage &&
            message.extendedTextMessage.text
        ) {
            return String(
                message.extendedTextMessage.text
            )
        }

        if (
            message.imageMessage &&
            message.imageMessage.caption
        ) {
            return String(
                message.imageMessage.caption
            )
        }

        if (
            message.videoMessage &&
            message.videoMessage.caption
        ) {
            return String(
                message.videoMessage.caption
            )
        }

        if (
            message.documentMessage &&
            message.documentMessage.caption
        ) {
            return String(
                message.documentMessage.caption
            )
        }

        if (
            message.ephemeralMessage &&
            message.ephemeralMessage.message
        ) {
            return getText({
                message:
                    message.ephemeralMessage.message
            })
        }

        if (
            message.viewOnceMessage &&
            message.viewOnceMessage.message
        ) {
            return getText({
                message:
                    message.viewOnceMessage.message
            })
        }

        if (
            message.viewOnceMessageV2 &&
            message.viewOnceMessageV2.message
        ) {
            return getText({
                message:
                    message.viewOnceMessageV2.message
            })
        }

        if (
            message.viewOnceMessageV2Extension &&
            message.viewOnceMessageV2Extension.message
        ) {
            return getText({
                message:
                    message.viewOnceMessageV2Extension.message
            })
        }

        if (
            message.documentWithCaptionMessage &&
            message.documentWithCaptionMessage.message
        ) {
            return getText({
                message:
                    message.documentWithCaptionMessage.message
            })
        }

    } catch (e) {
        console.error(
            '[BADWORD TEXT]',
            e.message
        )
    }

    return ''
}

// ==============================
// WARNING
// ==============================
const WARNINGS = [
    '🧠 Kata barusan bikin IQ obrolan turun drastis.',
    '🧹 Sudah kubersihkan kata toksikmu.',
    '🕊️ Tenang, orang besar diukur dari kontrol diri.',
    '📉 Kredibilitasmu barusan diskon 90%.',
    '🎯 Kritik itu perlu, cacian itu murahan.'
]

// ==============================
// BUILD CACHE
// ==============================
function buildCache(list) {
    const words = []

    for (
        const rawWord of list
    ) {
        if (
            typeof rawWord !==
            'string'
        ) {
            continue
        }

        const word =
            norm(rawWord)

        if (!word) {
            continue
        }

        const compact =
            compactText(word)

        if (!compact) {
            continue
        }

        words.push({
            original: rawWord,
            normalized: word,
            compact: compact
        })
    }

    return words
}

// ==============================
// GET CACHE
// ==============================
function getCache(list) {
    const signature =
        JSON.stringify(list)

    if (
        global[CACHE_KEY] &&
        global[CACHE_KEY].signature ===
            signature
    ) {
        return global[CACHE_KEY].words
    }

    const words =
        buildCache(list)

    global[CACHE_KEY] = {
        signature: signature,
        words: words
    }

    return words
}

// ==============================
// DETECT BADWORD
// ==============================
function detectBadword(
    text,
    list
) {
    try {
        if (!text) {
            return null
        }

        const original =
            norm(text)

        if (!original) {
            return null
        }

        const compact =
            compactText(original)

        if (!compact) {
            return null
        }

        const words =
            getCache(list)

        for (
            const item of words
        ) {
            const word =
                item.normalized

            const compactWord =
                item.compact

            if (!word) {
                continue
            }

            // ==========================
            // NORMAL
            // ==========================
            const normalRegex =
                new RegExp(
                    '(^|[^a-z0-9])' +
                    escapeRegex(word) +
                    '($|[^a-z0-9])',
                    'i'
                )

            if (
                normalRegex.test(original)
            ) {
                return word
            }

            // ==========================
            // COMPACT
            // ==========================
            //
            // k o n t o l
            // k.o.n.t.o.l
            // k-o-n-t-o-l
            //
            if (
                compact.indexOf(
                    compactWord
                ) !== -1
            ) {
                return word
            }
        }

    } catch (e) {
        console.error(
            '[BADWORD DETECTOR]',
            e.message
        )
    }

    return null
}

// ==============================
// WARNING COOLDOWN
// ==============================
// Cooldown HANYA untuk warning.
// TIDAK digunakan untuk delete.
// ==============================
function hitWarningCooldown(
    chat,
    sender,
    seconds
) {
    try {
        if (!global[COOLDOWN_KEY]) {
            global[COOLDOWN_KEY] = {}
        }

        const key =
            String(chat) +
            '|' +
            String(sender)

        const now =
            Date.now()

        const last =
            global[COOLDOWN_KEY][key] ||
            0

        if (
            now - last <
            seconds * 1000
        ) {
            return true
        }

        global[COOLDOWN_KEY][key] =
            now

        return false

    } catch (e) {
        return false
    }
}

// ==============================
// DELETE MESSAGE
// ==============================
async function deleteMessage(
    conn,
    m
) {
    try {
        if (
            !conn ||
            !m
        ) {
            return false
        }

        // ==============================
        // DIRECT KEY
        // ==============================
        if (
            m.key &&
            m.key.id
        ) {
            const deleteMsg = {
                delete: {
                    remoteJid:
                        m.key.remoteJid ||
                        m.chat,
                    fromMe:
                        m.key.fromMe ||
                        false,
                    id:
                        m.key.id
                }
            }

            if (
                m.key.participant
            ) {
                deleteMsg.delete.participant =
                    m.key.participant
            } else if (
                m.sender
            ) {
                deleteMsg.delete.participant =
                    m.sender
            }

            await conn.sendMessage(
                m.chat,
                deleteMsg
            )

            return true
        }

    } catch (e) {
        console.error(
            '[BADWORD DELETE KEY]',
            e.message
        )
    }

    // ==============================
    // QUOTED
    // ==============================
    try {
        if (
            m.quoted &&
            m.quoted.vM &&
            m.quoted.vM.key
        ) {
            await conn.sendMessage(
                m.chat,
                {
                    delete:
                        m.quoted.vM.key
                }
            )

            return true
        }

    } catch (e) {
        console.error(
            '[BADWORD DELETE QUOTED]',
            e.message
        )
    }

    // ==============================
    // CONTEXT INFO
    // ==============================
    try {
        const message =
            m.message || {}

        const extended =
            message.extendedTextMessage

        const context =
            extended &&
            extended.contextInfo

        if (
            context &&
            context.stanzaId
        ) {
            const deleteMsg = {
                delete: {
                    remoteJid:
                        m.chat,
                    fromMe: false,
                    id:
                        context.stanzaId
                }
            }

            if (
                context.participant
            ) {
                deleteMsg.delete.participant =
                    context.participant
            }

            await conn.sendMessage(
                m.chat,
                deleteMsg
            )

            return true
        }

    } catch (e) {
        console.error(
            '[BADWORD DELETE CONTEXT]',
            e.message
        )
    }

    return false
}

// ==============================
// SEND WARNING
// ==============================
async function sendWarning(
    conn,
    m,
    cfg
) {
    try {
        if (
            !conn ||
            !m
        ) {
            return
        }

        // ==============================
        // COOLDOWN HANYA WARNING
        // ==============================
        if (
            hitWarningCooldown(
                m.chat,
                m.sender,
                cfg.cooldown
            )
        ) {
            return
        }

        const warn =
            WARNINGS[
                Math.floor(
                    Math.random() *
                    WARNINGS.length
                )
            ]

        if (
            typeof conn.reply ===
            'function'
        ) {
            await conn.reply(
                m.chat,
                warn,
                m,
                {
                    mentions: [
                        m.sender
                    ]
                }
            )

            return
        }

        if (
            typeof conn.sendMessage ===
            'function'
        ) {
            await conn.sendMessage(
                m.chat,
                {
                    text: warn,
                    mentions: [
                        m.sender
                    ]
                },
                {
                    quoted: m
                }
            )
        }

    } catch (e) {
        console.error(
            '[BADWORD WARNING]',
            e.message
        )
    }
}

// ==============================
// COMMAND
// ==============================
let handler = async (
    m,
    {
        args,
        usedPrefix,
        command,
        isAdmin,
        isOwner
    }
) => {
    if (
        !/^(bw|badword|listbw|addbw|delbw)$/i.test(
            command
        )
    ) {
        return
    }

    const cfg =
        loadCfg()

    // ==============================
    // ADMIN CHECK
    // ==============================
    const adminOnly = () => {
        if (
            isOwner ||
            isAdmin
        ) {
            return false
        }

        m.reply(
            '❌ Perintah ini hanya untuk *Admin/Owner*'
        )

        return true
    }

    // ==============================
    // LIST
    // ==============================
    if (
        /^listbw$/i.test(command)
    ) {
        if (!cfg.list.length) {
            return m.reply(
                '📭 Badword di database masih kosong.'
            )
        }

        return m.reply(
            '📛 *DAFTAR BADWORD*\n\n' +
            'Total: ' +
            cfg.list.length +
            '\n\n' +
            cfg.list
                .map(
                    function (v, i) {
                        return (
                            String(i + 1) +
                            '. ' +
                            v
                        )
                    }
                )
                .join('\n')
        )
    }

    // ==============================
    // ADD
    // ==============================
    if (
        /^addbw$/i.test(command)
    ) {
        if (adminOnly()) {
            return
        }

        const word =
            args
                .join(' ')
                .trim()

        if (!word) {
            return m.reply(
                'Contoh:\n' +
                usedPrefix +
                'addbw laso'
            )
        }

        const normalized =
            norm(word)

        const exists =
            cfg.list.some(
                function (v) {
                    return (
                        norm(v) ===
                        normalized
                    )
                }
            )

        if (exists) {
            return m.reply(
                "⚠️ '" +
                word +
                "' sudah ada di database."
            )
        }

        cfg.list.push(word)

        if (!saveCfg(cfg)) {
            return m.reply(
                '❌ Gagal menyimpan database.'
            )
        }

        return m.reply(
            '✅ Badword berhasil ditambahkan.\n\n' +
            '📛 ' +
            word +
            '\n' +
            '💾 Tersimpan ke database.'
        )
    }

    // ==============================
    // DELETE
    // ==============================
    if (
        /^delbw$/i.test(command)
    ) {
        if (adminOnly()) {
            return
        }

        const word =
            args
                .join(' ')
                .trim()

        if (!word) {
            return m.reply(
                'Contoh:\n' +
                usedPrefix +
                'delbw laso'
            )
        }

        const normalized =
            norm(word)

        const oldLength =
            cfg.list.length

        cfg.list =
            cfg.list.filter(
                function (v) {
                    return (
                        norm(v) !==
                        normalized
                    )
                }
            )

        if (
            cfg.list.length ===
            oldLength
        ) {
            return m.reply(
                "⚠️ '" +
                word +
                "' tidak ditemukan di database."
            )
        }

        if (!saveCfg(cfg)) {
            return m.reply(
                '❌ Gagal menyimpan database.'
            )
        }

        return m.reply(
            '🗑️ Badword berhasil dihapus.\n\n' +
            '📛 ' +
            word +
            '\n' +
            '💾 Database sudah diperbarui.'
        )
    }

    // ==============================
    // SUB COMMAND
    // ==============================
    const sub =
        String(
            args[0] || ''
        ).toLowerCase()

    // ==============================
    // STATUS
    // ==============================
    if (
        !sub ||
        sub === 'status'
    ) {
        return m.reply(
            '📛 *BADWORD FILTER*\n\n' +
            'Status : ' +
            (
                cfg.on
                    ? '🟢 AKTIF'
                    : '🔴 NONAKTIF'
            ) +
            '\n' +
            'Cooldown : ' +
            cfg.cooldown +
            's\n' +
            'Bypass Admin : ' +
            (
                cfg.bypassAdmins
                    ? 'Ya'
                    : 'Tidak'
            ) +
            '\n' +
            'Total Badword : ' +
            cfg.list.length
        )
    }

    // ==============================
    // ON / OFF
    // ==============================
    if (
        sub === 'on' ||
        sub === 'off'
    ) {
        if (adminOnly()) {
            return
        }

        cfg.on =
            sub === 'on'

        if (!saveCfg(cfg)) {
            return m.reply(
                '❌ Gagal menyimpan status database.'
            )
        }

        return m.reply(
            '📛 Badword Filter ' +
            (
                cfg.on
                    ? '🟢 AKTIF'
                    : '🔴 NONAKTIF'
            )
        )
    }

    // ==============================
    // BW ADD
    // ==============================
    if (
        sub === 'add'
    ) {
        if (adminOnly()) {
            return
        }

        const word =
            args
                .slice(1)
                .join(' ')
                .trim()

        if (!word) {
            return m.reply(
                'Contoh:\n' +
                usedPrefix +
                'bw add laso'
            )
        }

        const normalized =
            norm(word)

        const exists =
            cfg.list.some(
                function (v) {
                    return (
                        norm(v) ===
                        normalized
                    )
                }
            )

        if (exists) {
            return m.reply(
                "⚠️ '" +
                word +
                "' sudah ada di database."
            )
        }

        cfg.list.push(word)

        if (!saveCfg(cfg)) {
            return m.reply(
                '❌ Gagal menyimpan database.'
            )
        }

        return m.reply(
            '✅ Ditambahkan ke database:\n\n📛 ' +
            word
        )
    }

    // ==============================
    // BW DELETE
    // ==============================
    if (
        sub === 'del' ||
        sub === 'rm' ||
        sub === 'hapus'
    ) {
        if (adminOnly()) {
            return
        }

        const word =
            args
                .slice(1)
                .join(' ')
                .trim()

        if (!word) {
            return m.reply(
                'Contoh:\n' +
                usedPrefix +
                'bw del laso'
            )
        }

        const normalized =
            norm(word)

        const oldLength =
            cfg.list.length

        cfg.list =
            cfg.list.filter(
                function (v) {
                    return (
                        norm(v) !==
                        normalized
                    )
                }
            )

        if (
            cfg.list.length ===
            oldLength
        ) {
            return m.reply(
                "⚠️ '" +
                word +
                "' tidak ditemukan di database."
            )
        }

        if (!saveCfg(cfg)) {
            return m.reply(
                '❌ Gagal menyimpan database.'
            )
        }

        return m.reply(
            '🗑️ Dihapus dari database:\n\n📛 ' +
            word
        )
    }
}

// ==============================
// AUTO BADWORD DETECTOR
// ==============================
handler.all = async function (m) {
    /*
     * Seluruh detector dibungkus try/catch.
     * Error satu pesan tidak boleh crash bot.
     */
    try {
        const cfg =
            loadCfg()

        // ==============================
        // FILTER OFF
        // ==============================
        if (!cfg.on) {
            return
        }

        // ==============================
        // GROUP ONLY
        // ==============================
        if (
            !m ||
            !m.chat ||
            !String(m.chat).endsWith(
                '@g.us'
            )
        ) {
            return
        }

        // ==============================
        // USER
        // ==============================
        if (!m.sender) {
            return
        }

        if (m.fromMe) {
            return
        }

        if (m.isOwner) {
            return
        }

        // ==============================
        // BYPASS ADMIN
        // ==============================
        if (
            cfg.bypassAdmins &&
            m.isAdmin
        ) {
            return
        }

        // ==============================
        // GET TEXT
        // ==============================
        const rawText =
            getText(m)

        if (!rawText) {
            return
        }

        // ==============================
        // DETECT
        // ==============================
        const detectedWord =
            detectBadword(
                rawText,
                cfg.list
            )

        if (!detectedWord) {
            return
        }

        console.log(
            '[BADWORD] ' +
            m.sender +
            ' -> ' +
            detectedWord
        )

        // ==============================
        // DELETE SELALU
        // ==============================
        //
        // Tidak ada cooldown di sini.
        // Spam tetap diproses.
        //
        let deleted = false

        try {
            deleted =
                await deleteMessage(
                    this,
                    m
                )
        } catch (e) {
            console.error(
                '[BADWORD DELETE]',
                e.message
            )
        }

        // ==============================
        // WARNING
        // ==============================
        //
        // Cooldown hanya membatasi
        // pesan warning, BUKAN delete.
        //
        try {
            await sendWarning(
                this,
                m,
                cfg
            )
        } catch (e) {
            console.error(
                '[BADWORD WARNING]',
                e.message
            )
        }

        console.log(
            '[BADWORD] message ' +
            (
                deleted
                    ? 'deleted'
                    : 'failed to delete'
            )
        )

    } catch (e) {
        /*
         * SAFETY NET TERAKHIR
         *
         * Jangan biarkan error detector
         * menghentikan handler/bot.
         */
        console.error(
            '[BADWORD HANDLER]',
            e.message
        )

        return
    }
}

// ==============================
// HANDLER CONFIG
// ==============================
handler.help = [
    'bw',
    'badword',
    'listbw',
    'addbw',
    'delbw'
]

handler.tags = [
    'moderation',
    'group'
]

handler.command =
    /^(bw|badword|listbw|addbw|delbw)$/i

handler.group = true

export default handler