//create code Wonge-bot

import os from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'

const format = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

const CPU_SAMPLE_MS = 200

// ==============================
// CPU SNAPSHOT
// ==============================

function cpuSnapshot() {

    const cpus = os.cpus()

    let idle = 0
    let total = 0

    for (const cpu of cpus) {

        const times = cpu.times

        total +=
            times.user +
            times.nice +
            times.sys +
            times.idle +
            times.irq

        idle += times.idle
    }

    return {
        idle,
        total
    }
}

// ==============================
// REAL CPU USAGE
// ==============================

async function cpuUsage(
    ms = CPU_SAMPLE_MS
) {

    const first = cpuSnapshot()

    await new Promise(resolve => {
        setTimeout(resolve, ms)
    })

    const second = cpuSnapshot()

    const idleDelta =
        second.idle -
        first.idle

    const totalDelta =
        second.total -
        first.total

    if (totalDelta <= 0) {
        return 0
    }

    const usage =
        (1 - idleDelta / totalDelta) * 100

    return Math.max(
        0,
        Math.min(100, usage)
    )
}

// ==============================
// BAR
// ==============================

function makeBar(value) {

    const length = 20

    const percent =
        Math.max(
            0,
            Math.min(100, value)
        )

    const filled =
        Math.round(
            percent / 100 * length
        )

    const empty =
        length - filled

    return (
        '▰'.repeat(filled) +
        '▱'.repeat(empty)
    )
}

// ==============================
// UPTIME
// ==============================

function clockString(ms) {

    if (!ms || isNaN(ms)) {
        return '0S'
    }

    const totalSeconds =
        Math.floor(ms / 1000)

    const days =
        Math.floor(
            totalSeconds / 86400
        )

    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        )

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        )

    const seconds =
        totalSeconds % 60

    const result = []

    if (days > 0) {
        result.push(`${days}D`)
    }

    if (hours > 0) {
        result.push(`${hours}H`)
    }

    if (minutes > 0) {
        result.push(`${minutes}M`)
    }

    result.push(`${seconds}S`)

    return result.join(' ')
}

// ==============================
// HANDLER
// ==============================

const handler = async (m, { conn }) => {

    // ==========================
    // START
    // ==========================

    const start =
        performance.now()

    // ==========================
    // CPU
    // ==========================

    let cpuPct = 0

    try {

        cpuPct =
            await cpuUsage(
                CPU_SAMPLE_MS
            )

    } catch (e) {

        console.error(
            '[PING] CPU error:',
            e
        )
    }

    // ==========================
    // PROCESS MEMORY
    // ==========================

    const processMemory =
        process.memoryUsage()

    // ==========================
    // SYSTEM MEMORY
    // ==========================

    const totalMem =
        os.totalmem()

    const freeMem =
        os.freemem()

    const usedMem =
        totalMem -
        freeMem

    const ramPct =
        totalMem > 0
            ? (
                usedMem /
                totalMem
            ) * 100
            : 0

    // ==========================
    // CPU INFORMATION
    // ==========================

    const cpus =
        os.cpus()

    const cores =
        cpus.length || 1

    const cpuModel =
        cpus[0]?.model?.trim() ||
        'Unknown'

    // ==========================
    // LOAD AVERAGE
    // ==========================

    const load =
        os.loadavg()

    const load1 =
        load[0] || 0

    const load5 =
        load[1] || 0

    const load15 =
        load[2] || 0

    // Load 1 menit dibanding
    // jumlah core.

    const loadPct =
        Math.min(
            100,
            (
                load1 /
                cores
            ) * 100
        )

    // ==========================
    // NODE HEAP
    // ==========================

    const heapUsed =
        processMemory.heapUsed

    const heapTotal =
        processMemory.heapTotal

    const heapPct =
        heapTotal > 0
            ? (
                heapUsed /
                heapTotal
            ) * 100
            : 0

    // ==========================
    // NODE RSS
    // ==========================

    const rss =
        processMemory.rss

    const external =
        processMemory.external

    // ==========================
    // RUNTIME
    // ==========================

    const runtime =
        clockString(
            process.uptime() * 1000
        )

    // ==========================
    // SPEED
    // ==========================

    const speed =
        Math.round(
            performance.now() -
            start
        )

    // ==========================
    // SYSTEM STATUS
    // ==========================

    const txt =
`≡ SYSTEM STATUS

▸ Speed  : ${speed} ms
▸ Runtime: ${runtime}

▸ CPU    : ${cpuModel}
▸ Cores  : ${cores}
▸ Load   : ${load1.toFixed(2)} / ${load5.toFixed(2)} / ${load15.toFixed(2)}

▸ RAM    : ${format(usedMem)} / ${format(totalMem)}
${makeBar(ramPct)}

▸ CPU    : ${cpuPct.toFixed(1)}%
${makeBar(cpuPct)}

▸ LOAD   : ${loadPct.toFixed(1)}%
${makeBar(loadPct)}

▸ HEAP   : ${format(heapUsed)} / ${format(heapTotal)}
${makeBar(heapPct)}

▸ RSS    : ${format(rss)}
▸ EXT    : ${format(external)}

▸ OS     : ${os.platform().toUpperCase()} ${os.arch()}
▸ Node   : ${process.version}
▸ PID    : ${process.pid}
▸ Host   : ${os.hostname()}`

    // ==========================
    // SEND
    // ==========================

    try {

        await conn.sendMessage(
            m.chat,
            {
                text: txt
            },
            {
                quoted: m
            }
        )

    } catch (e) {

        console.error(
            '[PING] send error:',
            e
        )

        try {

            await m.reply(txt)

        } catch (err) {

            console.error(
                '[PING] fallback error:',
                err
            )
        }
    }
}

// ==============================
// COMMAND
// ==============================

handler.help = [
    'ping',
    'speed'
]

handler.tags = [
    'info'
]

handler.command =
    /^(ping|speed|pong|ingfo)$/i

export default handler