//create code Wonge-bot

let handler = async (m, { conn }) => {
    try {
        const newsletter = conn._client?.newsletter

        if (!newsletter) {
            return m.reply('API newsletter tidak tersedia.')
        }

        let methods = Object.keys(newsletter)

        let proto = Object.getPrototypeOf(newsletter)

        if (proto) {
            methods = [
                ...new Set([
                    ...methods,
                    ...Object.getOwnPropertyNames(proto)
                ])
            ]
        }

        m.reply(
            `*NEWSLETTER API*\n\n` +
            methods
                .filter(v => v !== 'constructor')
                .sort()
                .join('\n')
        )

    } catch (e) {
        console.error(e)
        m.reply('Gagal membaca API newsletter.')
    }
}

handler.help = ['ceknewsletter']
handler.tags = ['tools']
handler.command = /^ceknewsletter$/i
handler.limit = false

export default handler