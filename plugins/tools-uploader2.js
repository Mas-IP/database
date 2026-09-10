//create code Wonge-bot

import axios from 'axios'

let handler = async (m, { conn }) => {
    let msg = null

    try {
        // ==============================
        // CONFIG
        // ==============================
        const TOKEN = global.githubToken
        const OWNER = global.githubOwner
        const REPO = global.githubRepo
        const BRANCH = global.githubBranch || 'main'

        // ==============================
        // CEK CONFIG GITHUB
        // ==============================
        if (!TOKEN) {
            throw new Error(
                'githubToken belum disetting'
            )
        }

        if (!OWNER) {
            throw new Error(
                'githubOwner belum disetting'
            )
        }

        if (!REPO) {
            throw new Error(
                'githubRepo belum disetting'
            )
        }

        // ==============================
        // CEK QUOTED / FILE
        // ==============================
        const q = m.quoted ? m.quoted : m

        let mime = ''

        if (q.mimetype) {
            mime = q.mimetype
        } else if (q.msg && q.msg.mimetype) {
            mime = q.msg.mimetype
        } else if (q.message && q.message.mimetype) {
            mime = q.message.mimetype
        }

        mime = String(mime || '').toLowerCase()

        if (!mime) {
            return m.reply(
                '❌ File tidak ditemukan.\n\n' +
                'Kirim file atau reply file dengan command:\n' +
                '.tourl2'
            )
        }

        // ==============================
        // DETEKSI TYPE
        // ==============================
        let type = ''
        let ext = ''

        if (mime.startsWith('image/')) {
            type = 'image'

            if (mime.includes('png')) {
                ext = 'png'
            } else if (mime.includes('gif')) {
                ext = 'gif'
            } else if (mime.includes('webp')) {
                type = 'sticker'
                ext = 'webp'
            } else {
                ext = 'jpg'
            }

        } else if (mime.startsWith('video/')) {
            type = 'video'

            if (mime.includes('webm')) {
                ext = 'webm'
            } else if (mime.includes('mkv')) {
                ext = 'mkv'
            } else {
                ext = 'mp4'
            }

        } else if (mime.startsWith('audio/')) {
            type = 'audio'

            if (mime.includes('ogg')) {
                ext = 'ogg'
            } else if (mime.includes('wav')) {
                ext = 'wav'
            } else {
                ext = 'mp3'
            }

        } else if (mime.includes('webp')) {
            type = 'sticker'
            ext = 'webp'

        } else {
            return m.reply(
                `❌ Format tidak didukung.\n\n` +
                `MIME: ${mime}`
            )
        }

        // ==============================
        // PESAN PROSES
        // ==============================
        msg = await conn.reply(
            m.chat,
            '⏳ Memproses file...',
            m
        )

        const sleep = ms =>
            new Promise(resolve => setTimeout(resolve, ms))

        await sleep(500)

        // ==============================
        // STATUS DOWNLOAD
        // ==============================
        if (msg && msg.key) {
            await conn.sendMessage(
                m.chat,
                {
                    text: '📥 Mengambil file...',
                    edit: msg.key
                }
            ).catch(() => {})
        }

        // ==============================
        // DOWNLOAD FILE
        // ==============================
        let buffer

        try {
            buffer = await q.download()
        } catch (downloadError) {
            console.error(
                '[TOURL2 DOWNLOAD ERROR]',
                downloadError
            )

            throw new Error(
                'Gagal download file dari WhatsApp'
            )
        }

        if (!buffer) {
            throw new Error(
                'Buffer file kosong'
            )
        }

        if (!Buffer.isBuffer(buffer)) {
            buffer = Buffer.from(buffer)
        }

        if (!buffer.length) {
            throw new Error(
                'Ukuran file 0 byte'
            )
        }

        // ==============================
        // BATAS UKURAN
        // ==============================
        const maxSize = 50 * 1024 * 1024

        if (buffer.length > maxSize) {
            throw new Error(
                'Ukuran file terlalu besar. Maksimal 50 MB'
            )
        }

        // ==============================
        // INFO FILE
        // ==============================
        const fileSizeMB = (
            buffer.length /
            1024 /
            1024
        ).toFixed(2)

        console.log(
            `[TOURL2] MIME: ${mime}`
        )

        console.log(
            `[TOURL2] TYPE: ${type}`
        )

        console.log(
            `[TOURL2] SIZE: ${fileSizeMB} MB`
        )

        // ==============================
        // STATUS UPLOAD
        // ==============================
        if (msg && msg.key) {
            await conn.sendMessage(
                m.chat,
                {
                    text:
                        `📤 Upload ke GitHub...\n\n` +
                        `📦 Type: ${type}\n` +
                        `📊 Size: ${fileSizeMB} MB`,
                    edit: msg.key
                }
            ).catch(() => {})
        }

        // ==============================
        // BASE64
        // ==============================
        const base64 = buffer.toString('base64')

        if (!base64) {
            throw new Error(
                'Gagal mengubah file menjadi Base64'
            )
        }

        // ==============================
        // FILE NAME
        // ==============================
        const timestamp = Date.now()

        const fileName =
            `${type}_${timestamp}.${ext}`

        const filePath =
            `assets/${type}/${fileName}`

        // ==============================
        // GITHUB API URL
        // ==============================
        const encodedPath = filePath
            .split('/')
            .map(part => encodeURIComponent(part))
            .join('/')

        const apiUrl =
            `https://api.github.com/repos/` +
            `${encodeURIComponent(OWNER)}/` +
            `${encodeURIComponent(REPO)}/` +
            `contents/${encodedPath}`

        console.log(
            `[TOURL2] Repository: ${OWNER}/${REPO}`
        )

        console.log(
            `[TOURL2] Branch: ${BRANCH}`
        )

        console.log(
            `[TOURL2] Path: ${filePath}`
        )

        // ==============================
        // UPLOAD GITHUB
        // ==============================
        let response

        try {
            response = await axios.put(
                apiUrl,
                {
                    message:
                        `upload ${fileName}`,
                    content: base64,
                    branch: BRANCH
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${TOKEN}`,

                        Accept:
                            'application/vnd.github+json',

                        'X-GitHub-Api-Version':
                            '2022-11-28',

                        'User-Agent':
                            'Wonge-bot'
                    },

                    timeout: 60000,

                    maxContentLength:
                        Infinity,

                    maxBodyLength:
                        Infinity,

                    validateStatus:
                        () => true
                }
            )
        } catch (githubRequestError) {
            console.error(
                '[TOURL2 REQUEST ERROR]',
                githubRequestError.message
            )

            throw new Error(
                `Tidak dapat terhubung ke GitHub API: ${githubRequestError.message}`
            )
        }

        // ==============================
        // CEK RESPONSE GITHUB
        // ==============================
        console.log(
            '[TOURL2] GitHub Status:',
            response.status
        )

        if (
            response.status < 200 ||
            response.status >= 300
        ) {
            const githubData =
                response.data || {}

            console.error(
                '[TOURL2 GITHUB ERROR]',
                githubData
            )

            let reason =
                githubData.message ||
                'GitHub API menolak upload'

            // ==============================
            // ERROR KHUSUS GITHUB
            // ==============================
            if (response.status === 401) {
                reason =
                    'Token GitHub tidak valid atau sudah expired'
            }

            else if (response.status === 403) {
                reason =
                    'Token GitHub tidak memiliki permission untuk upload ke repository'
            }

            else if (response.status === 404) {
                reason =
                    'Repository tidak ditemukan atau token tidak memiliki akses'
            }

            else if (response.status === 409) {
                reason =
                    'Conflict pada repository/branch GitHub'
            }

            else if (response.status === 422) {
                reason =
                    githubData.message ||
                    'Data upload ditolak GitHub'
            }

            throw new Error(
                `GitHub ${response.status}: ${reason}`
            )
        }

        // ==============================
        // AMBIL URL
        // ==============================
        const rawUrl =
            `https://raw.githubusercontent.com/` +
            `${OWNER}/${REPO}/` +
            `${BRANCH}/` +
            `${filePath}`

        const githubUrl =
            response.data?.content?.html_url ||
            `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${filePath}`

        console.log(
            '[TOURL2] Upload berhasil'
        )

        console.log(
            '[TOURL2] Raw URL:',
            rawUrl
        )

        // ==============================
        // SELESAI
        // ==============================
        await sleep(500)

        const successText =
            `✅ Upload Berhasil\n\n` +
            `📦 Type: ${type}\n` +
            `📄 File: ${fileName}\n` +
            `📊 Size: ${fileSizeMB} MB\n` +
            `🌿 Branch: ${BRANCH}\n\n` +
            `🔗 ${rawUrl}`

        if (msg && msg.key) {
            await conn.sendMessage(
                m.chat,
                {
                    text: successText,
                    edit: msg.key
                }
            ).catch(async () => {
                await m.reply(successText)
                    .catch(() => {})
            })
        } else {
            await m.reply(successText)
                .catch(() => {})
        }

    } catch (e) {

        // ==============================
        // ERROR DETAIL
        // ==============================
        console.error(
            '\n========== TOURL2 ERROR =========='
        )

        console.error(
            e.response?.data ||
            e.message ||
            e
        )

        console.error(
            '==================================\n'
        )

        // ==============================
        // ERROR MESSAGE
        // ==============================
        let errorText =
            e?.message ||
            'Unknown error'

        // ==============================
        // TAMPILKAN ERROR KE USER
        // ==============================
        const failText =
            `❌ Upload Gagal\n\n` +
            `⚠️ ${errorText}`

        if (msg && msg.key) {

            await conn.sendMessage(
                m.chat,
                {
                    text: failText,
                    edit: msg.key
                }
            ).catch(async () => {

                await m.reply(failText)
                    .catch(() => {})

            })

        } else {

            await m.reply(failText)
                .catch(() => {})

        }
    }
}

// ==============================
// HANDLER
// ==============================

handler.command = /^tourl2$/i
handler.tags = ['tools']
handler.help = ['tourl2']
handler.limit = false
handler.premium = true

export default handler