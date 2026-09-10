//create code Wonge-bot

var name = global.nameowner
var numberowner = global.numberowner
var gmail = global.mail

var handler = async (m, { conn }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN: ${name}
item.ORG: Creator Bot
item1.TEL;waid=${numberowner}:${numberowner}@s.whatsapp.net
item1.X-ABLabel:Nomor Creator Bot 
item2.EMAIL;type=INTERNET:${gmail}
item2.X-ABLabel:Email Owner
item3.ADR:;;🇮🇩 Indonesia;;;;
item3.X-ABADR:ac
item5.URL:${instagram}
item5.X-ABLabel:Website
item6.URL:https://whatsapp.com/channel/0029VbCH7xYAu3aFuRqPiI1O
item6.X-ABLabel:Saluran Bot
END:VCARD`

    const sentMsg = await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: 'CN',
                contacts: [{ vcard }]
            }
        }
    )

    await conn.reply(m.chat, 'Itu Adalah nomor owner Bot', sentMsg)
}

handler.command = handler.help = ['owner', 'creator']
handler.tags = ['info']
handler.limit = false

export default handler