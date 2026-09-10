//create code Wonge-bot

const PAJAK = 0.05

let handler = async (m, { conn }) => {
    if (!global.db || !global.db.data || !global.db.data.users) {
        return m.reply('Database user tidak ditemukan.')
    }

    const users = global.db.data.users

    let totalPajak = 0
    let totalMember = 0

    for (const jid in users) {
        // Jangan pajaki owner
        if (global.owner && global.owner.some(owner => {
            const nomorOwner = String(owner)
                .replace(/[^0-9]/g, '')

            const nomorUser = String(jid)
                .split('@')[0]
                .replace(/[^0-9]/g, '')

            return nomorOwner === nomorUser
        })) {
            continue
        }

        const user = users[jid]

        if (!user) continue

        const bank = Number(user.bank) || 0

        if (bank <= 0) continue

        const pajak = Math.floor(bank * PAJAK)

        if (pajak <= 0) continue

        user.bank = bank - pajak

        totalPajak += pajak
        totalMember++
    }

    // Owner pertama
    let ownerJid = null

    if (global.owner && global.owner.length) {
        const ownerNumber = String(global.owner[0])
            .replace(/[^0-9]/g, '')

        ownerJid = ownerNumber + '@s.whatsapp.net'
    }

    if (!ownerJid || !users[ownerJid]) {
        return m.reply('Data owner tidak ditemukan di database.')
    }

    users[ownerJid].money =
        (Number(users[ownerJid].money) || 0) + totalPajak

    await m.reply(
        `💰 *PAJAK MEMBER*\n\n` +
        `▢ Tarif: *5%*\n` +
        `▢ Sumber: *Bank*\n` +
        `▢ Member terkena pajak: *${totalMember}*\n` +
        `▢ Total pajak: *${totalPajak} Money*\n` +
        `▢ Masuk ke owner: *${totalPajak} Money*`
    )
}

handler.help = ['pajak']
handler.tags = ['owner']
handler.command = /^pajak$/i
handler.owner = true

export default handler