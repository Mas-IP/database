//create code Wonge-bot

import fs from 'fs';
import path from 'path';


// ==================================================
// PATH
// ==================================================

const DATABASE_DIR = path.join(
    process.cwd(),
    'database'
);

const TRADING_FILE = path.join(
    DATABASE_DIR,
    'trading.json'
);


// ==================================================
// MARKET CONFIG
// ==================================================

const MARKET_NAME = 'BANKKE';


// Harga awal
const START_PRICE = 10000;


// Range market
const MIN_PRICE = 10000;
const MAX_PRICE = 100000;


// Update setiap 1 menit
const MARKET_INTERVAL = 60 * 1000;


// History chart
const MAX_HISTORY = 30;


// Minimal transaksi
const MIN_TRADE = 1000;


// ==================================================
// MARKET MOVEMENT
// ==================================================
//
// Normal market:
// sekitar 0.5% - 3%
//
// Market kuat:
// sekitar 2% - 5%
//
// Shock:
// jarang, maksimal sekitar 8%
//
// Jadi market tidak meloncat terus-terusan.
// ==================================================

const MAX_NORMAL_CHANGE = 0.045;
const MAX_SHOCK_CHANGE = 0.08;


// ==================================================
// REGIME
// ==================================================

const REGIMES = [
    'SIDEWAYS',
    'UP',
    'DOWN',
    'REBOUND',
    'DROP'
];


// ==================================================
// DEFAULT MARKET
// ==================================================

function createDefaultMarket() {

    return {

        name: MARKET_NAME,

        price: START_PRICE,

        previousPrice: START_PRICE,

        lastUpdate: Date.now(),

        history: [
            START_PRICE
        ],

        regime: 'SIDEWAYS',

        regimeTicks: 0,

        momentum: 0,

        volatility: 0.01
    };
}


// ==================================================
// LOAD MARKET
// ==================================================

function loadMarket() {

    try {

        if (!fs.existsSync(DATABASE_DIR)) {

            fs.mkdirSync(
                DATABASE_DIR,
                {
                    recursive: true
                }
            );
        }


        if (!fs.existsSync(TRADING_FILE)) {

            const market =
                createDefaultMarket();

            saveMarket(market);

            return market;
        }


        const raw =
            fs.readFileSync(
                TRADING_FILE,
                'utf8'
            );


        if (!raw.trim()) {

            const market =
                createDefaultMarket();

            saveMarket(market);

            return market;
        }


        const market =
            JSON.parse(raw);


        // ==================================================
        // BASIC VALIDATION
        // ==================================================

        if (
            typeof market.price !== 'number' ||
            !isFinite(market.price)
        ) {

            market.price =
                START_PRICE;
        }


        if (
            typeof market.previousPrice !== 'number' ||
            !isFinite(market.previousPrice)
        ) {

            market.previousPrice =
                market.price;
        }


        if (
            typeof market.lastUpdate !== 'number' ||
            !isFinite(market.lastUpdate)
        ) {

            market.lastUpdate =
                Date.now();
        }


        // ==================================================
        // REGIME VALIDATION
        // ==================================================

        if (
            !REGIMES.includes(
                market.regime
            )
        ) {

            market.regime =
                'SIDEWAYS';
        }


        if (
            typeof market.regimeTicks !== 'number' ||
            !isFinite(market.regimeTicks) ||
            market.regimeTicks < 0
        ) {

            market.regimeTicks = 0;
        }


        if (
            typeof market.momentum !== 'number' ||
            !isFinite(market.momentum)
        ) {

            market.momentum = 0;
        }


        if (
            typeof market.volatility !== 'number' ||
            !isFinite(market.volatility)
        ) {

            market.volatility = 0.01;
        }


        // ==================================================
        // HISTORY
        // ==================================================

        if (
            !Array.isArray(
                market.history
            )
        ) {

            market.history = [];
        }


        market.history =
            market.history
                .filter(
                    price =>
                        typeof price === 'number' &&
                        isFinite(price)
                )
                .map(
                    price =>
                        clamp(
                            price,
                            MIN_PRICE,
                            MAX_PRICE
                        )
                );


        if (
            market.history.length === 0
        ) {

            market.history.push(
                market.price
            );
        }


        while (
            market.history.length >
            MAX_HISTORY
        ) {

            market.history.shift();
        }


        // ==================================================
        // PRICE RANGE
        // ==================================================

        market.price =
            clamp(
                market.price,
                MIN_PRICE,
                MAX_PRICE
            );


        market.previousPrice =
            clamp(
                market.previousPrice,
                MIN_PRICE,
                MAX_PRICE
            );


        return market;

    } catch (error) {

        console.error(
            '[TRADING] LOAD ERROR:',
            error
        );

        return createDefaultMarket();
    }
}


// ==================================================
// SAVE MARKET
// ==================================================

function saveMarket(market) {

    try {

        if (!fs.existsSync(DATABASE_DIR)) {

            fs.mkdirSync(
                DATABASE_DIR,
                {
                    recursive: true
                }
            );
        }


        fs.writeFileSync(
            TRADING_FILE,
            JSON.stringify(
                market,
                null,
                2
            )
        );


        return true;

    } catch (error) {

        console.error(
            '[TRADING] SAVE ERROR:',
            error
        );

        return false;
    }
}


// ==================================================
// UPDATE MARKET
// ==================================================

function updateMarket(market) {

    const now =
        Date.now();


    if (
        !market.lastUpdate ||
        !isFinite(market.lastUpdate)
    ) {

        market.lastUpdate =
            now;

        return false;
    }


    const elapsed =
        now -
        market.lastUpdate;


    if (
        elapsed <
        MARKET_INTERVAL
    ) {

        return false;
    }


    let ticks =
        Math.floor(
            elapsed /
            MARKET_INTERVAL
        );


    /*
     * Kalau bot mati lama,
     * maksimal 30 tick sekaligus.
     */
    if (
        ticks > 30
    ) {

        ticks = 30;
    }


    let changed = false;


    for (
        let i = 0;
        i < ticks;
        i++
    ) {

        updateSingleTick(
            market
        );

        changed = true;
    }


    market.lastUpdate +=
        ticks *
        MARKET_INTERVAL;


    return changed;
}


// ==================================================
// SINGLE MARKET TICK
// ==================================================

function updateSingleTick(market) {

    const oldPrice =
        market.price;


    // ==================================================
    // REGIME TICK
    // ==================================================

    market.regimeTicks++;


    /*
     * Regime tidak boleh berganti
     * setiap tick.
     *
     * Minimal 3 menit.
     * Maksimal sekitar 10 menit.
     */
    if (
        shouldChangeRegime(
            market
        )
    ) {

        market.regime =
            chooseNextRegime(
                market
            );

        market.regimeTicks = 0;
    }


    // ==================================================
    // DRIFT
    // ==================================================

    let drift = 0;


    switch (
        market.regime
    ) {

        case 'UP':

            drift =
                randomBetween(
                    0.002,
                    0.010
                );

            break;


        case 'DOWN':

            drift =
                randomBetween(
                    -0.010,
                    -0.002
                );

            break;


        case 'REBOUND':

            drift =
                randomBetween(
                    0.004,
                    0.014
                );

            break;


        case 'DROP':

            drift =
                randomBetween(
                    -0.020,
                    -0.006
                );

            break;


        default:

            // SIDEWAYS

            drift =
                randomBetween(
                    -0.0035,
                    0.0035
                );

            break;
    }


    // ==================================================
    // MOMENTUM
    // ==================================================

    market.momentum =
        (
            market.momentum *
            0.65
        ) +
        (
            drift *
            0.35
        );


    // ==================================================
    // VOLATILITY
    // ==================================================

    market.volatility =
        randomBetween(
            0.006,
            0.016
        );


    // ==================================================
    // RANDOM NOISE
    // ==================================================

    const noise =
        randomNormal() *
        market.volatility;


    // ==================================================
    // PRICE POSITION
    // ==================================================

    const range =
        MAX_PRICE -
        MIN_PRICE;


    const normalized =
        (
            market.price -
            MIN_PRICE
        ) /
        range;


    // ==================================================
    // BOUNDARY PRESSURE
    // ==================================================
    //
    // Area bawah:
    // memberi tekanan rebound.
    //
    // Area atas:
    // memberi tekanan turun.
    //
    // Ini membuat market tidak
    // terus menempel di 10K / 100K.
    // ==================================================

    let boundaryPressure = 0;


    // --------------------------------------------------
    // DEKAT BAWAH
    // --------------------------------------------------

    if (
        normalized < 0.12
    ) {

        boundaryPressure =
            (
                0.12 -
                normalized
            ) *
            0.055;
    }


    // --------------------------------------------------
    // DEKAT ATAS
    // --------------------------------------------------

    if (
        normalized > 0.78
    ) {

        boundaryPressure =
            -(
                normalized -
                0.78
            ) *
            0.075;
    }


    // ==================================================
    // EXTREME PRICE PRESSURE
    // ==================================================

    /*
     * Kalau sudah sangat tinggi,
     * kemungkinan DROP diperbesar.
     */

    if (
        normalized > 0.90
    ) {

        boundaryPressure -=
            0.012;
    }


    /*
     * Kalau sangat rendah,
     * kemungkinan REBOUND diperbesar.
     */

    if (
        normalized < 0.08
    ) {

        boundaryPressure +=
            0.012;
    }


    // ==================================================
    // TOTAL CHANGE
    // ==================================================

    let change =
        market.momentum +
        drift +
        noise +
        boundaryPressure;


    // ==================================================
    // MARKET EVENT
    // ==================================================

    const eventRoll =
        Math.random();


    /*
     * Shock tidak sering terjadi.
     */

    if (
        eventRoll < 0.018
    ) {

        change +=
            randomBetween(
                -MAX_SHOCK_CHANGE,
                MAX_SHOCK_CHANGE
            );
    }


    // ==================================================
    // FORCE DROP AT HIGH PRICE
    // ==================================================

    /*
     * Saat harga sudah sangat tinggi,
     * jangan biarkan terlalu lama.
     */

    if (
        normalized > 0.94
    ) {

        change =
            Math.min(
                change,
                randomBetween(
                    -0.035,
                    -0.012
                )
            );
    }


    // ==================================================
    // FORCE REBOUND AT LOW PRICE
    // ==================================================

    if (
        normalized < 0.055
    ) {

        change =
            Math.max(
                change,
                randomBetween(
                    0.010,
                    0.030
                )
            );
    }


    // ==================================================
    // LIMIT NORMAL CHANGE
    // ==================================================

    change =
        clamp(
            change,
            -MAX_NORMAL_CHANGE,
            MAX_NORMAL_CHANGE
        );


    // ==================================================
    // NEW PRICE
    // ==================================================

    let newPrice =
        oldPrice *
        (
            1 +
            change
        );


    // ==================================================
    // HARD LIMIT
    // ==================================================

    newPrice =
        clamp(
            newPrice,
            MIN_PRICE,
            MAX_PRICE
        );


    newPrice =
        Math.round(
            newPrice
        );


    newPrice =
        clamp(
            newPrice,
            MIN_PRICE,
            MAX_PRICE
        );


    // ==================================================
    // UPDATE
    // ==================================================

    market.previousPrice =
        oldPrice;


    market.price =
        newPrice;


    market.history.push(
        newPrice
    );


    while (
        market.history.length >
        MAX_HISTORY
    ) {

        market.history.shift();
    }
}


// ==================================================
// REGIME CHANGE
// ==================================================

function shouldChangeRegime(market) {

    const ticks =
        market.regimeTicks;


    // Minimal 3 menit
    if (
        ticks < 3
    ) {

        return false;
    }


    // Maksimal 10 menit
    if (
        ticks >= 10
    ) {

        return true;
    }


    /*
     * Semakin lama regime berjalan,
     * semakin besar peluang berubah.
     */

    const probability =
        0.08 +
        (
            ticks *
            0.045
        );


    return Math.random() <
        probability;
}


// ==================================================
// CHOOSE NEXT REGIME
// ==================================================

function chooseNextRegime(market) {

    const current =
        market.regime;


    const normalized =
        (
            market.price -
            MIN_PRICE
        ) /
        (
            MAX_PRICE -
            MIN_PRICE
        );


    // ==================================================
    // HARGA SANGAT TINGGI
    // ==================================================

    if (
        normalized > 0.88
    ) {

        const roll =
            Math.random();


        if (
            roll < 0.50
        ) {

            return 'DROP';
        }


        if (
            roll < 0.78
        ) {

            return 'DOWN';
        }


        return 'SIDEWAYS';
    }


    // ==================================================
    // HARGA SANGAT RENDAH
    // ==================================================

    if (
        normalized < 0.12
    ) {

        const roll =
            Math.random();


        if (
            roll < 0.50
        ) {

            return 'REBOUND';
        }


        if (
            roll < 0.78
        ) {

            return 'UP';
        }


        return 'SIDEWAYS';
    }


    // ==================================================
    // DROP
    // ==================================================

    if (
        current === 'DROP'
    ) {

        const roll =
            Math.random();


        /*
         * Setelah drop,
         * rebound cukup sering.
         */

        if (
            roll < 0.45
        ) {

            return 'REBOUND';
        }


        if (
            roll < 0.72
        ) {

            return 'DOWN';
        }


        if (
            roll < 0.90
        ) {

            return 'SIDEWAYS';
        }


        return 'UP';
    }


    // ==================================================
    // DOWN
    // ==================================================

    if (
        current === 'DOWN'
    ) {

        const roll =
            Math.random();


        if (
            roll < 0.42
        ) {

            return 'REBOUND';
        }


        if (
            roll < 0.68
        ) {

            return 'DROP';
        }


        if (
            roll < 0.88
        ) {

            return 'SIDEWAYS';
        }


        return 'UP';
    }


    // ==================================================
    // REBOUND
    // ==================================================

    if (
        current === 'REBOUND'
    ) {

        const roll =
            Math.random();


        if (
            roll < 0.45
        ) {

            return 'UP';
        }


        if (
            roll < 0.72
        ) {

            return 'SIDEWAYS';
        }


        if (
            roll < 0.88
        ) {

            return 'DOWN';
        }


        return 'DROP';
    }


    // ==================================================
    // UP
    // ==================================================

    if (
        current === 'UP'
    ) {

        const roll =
            Math.random();


        /*
         * Setelah naik,
         * jangan selalu lanjut naik.
         */

        if (
            roll < 0.35
        ) {

            return 'SIDEWAYS';
        }


        if (
            roll < 0.62
        ) {

            return 'DOWN';
        }


        if (
            roll < 0.82
        ) {

            return 'DROP';
        }


        return 'UP';
    }


    // ==================================================
    // SIDEWAYS
    // ==================================================

    const roll =
        Math.random();


    if (
        roll < 0.30
    ) {

        return 'UP';
    }


    if (
        roll < 0.58
    ) {

        return 'DOWN';
    }


    if (
        roll < 0.76
    ) {

        return 'REBOUND';
    }


    if (
        roll < 0.90
    ) {

        return 'DROP';
    }


    return 'SIDEWAYS';
}


// ==================================================
// USER INIT
// ==================================================

function initUser(user) {

    // ==================================================
    // MONEY
    // ==================================================

    if (
        typeof user.money !== 'number' ||
        !isFinite(user.money)
    ) {

        user.money = 0;
    }


    // ==================================================
    // TRADING OBJECT
    // ==================================================

    if (
        !user.trading ||
        typeof user.trading !== 'object'
    ) {

        user.trading = {};
    }


    // ==================================================
    // MIGRASI DATABASE LAMA
    // ==================================================

    /*
     * Database lama:
     *
     * position
     * buyPrice
     *
     * Database baru:
     *
     * coin
     * avgBuy
     * totalInvested
     */

    if (
        typeof user.trading.coin !== 'number' ||
        !isFinite(user.trading.coin) ||
        user.trading.coin < 0
    ) {

        if (
            typeof user.trading.position === 'number' &&
            user.trading.position > 0 &&
            typeof user.trading.buyPrice === 'number' &&
            user.trading.buyPrice > 0
        ) {

            user.trading.coin =
                user.trading.position /
                user.trading.buyPrice;

        } else {

            user.trading.coin = 0;
        }
    }


    // ==================================================
    // AVG BUY
    // ==================================================

    if (
        typeof user.trading.avgBuy !== 'number' ||
        !isFinite(user.trading.avgBuy) ||
        user.trading.avgBuy < 0
    ) {

        if (
            typeof user.trading.buyPrice === 'number' &&
            user.trading.buyPrice > 0
        ) {

            user.trading.avgBuy =
                user.trading.buyPrice;

        } else {

            user.trading.avgBuy = 0;
        }
    }


    // ==================================================
    // TOTAL INVESTED
    // ==================================================

    if (
        typeof user.trading.totalInvested !== 'number' ||
        !isFinite(user.trading.totalInvested) ||
        user.trading.totalInvested < 0
    ) {

        if (
            typeof user.trading.position === 'number' &&
            user.trading.position > 0
        ) {

            user.trading.totalInvested =
                user.trading.position;

        } else if (
            user.trading.coin > 0 &&
            user.trading.avgBuy > 0
        ) {

            user.trading.totalInvested =
                user.trading.coin *
                user.trading.avgBuy;

        } else {

            user.trading.totalInvested = 0;
        }
    }


    // ==================================================
    // LAST ACTION
    // ==================================================

    if (
        typeof user.trading.lastAction !== 'number' ||
        !isFinite(user.trading.lastAction)
    ) {

        user.trading.lastAction = 0;
    }


    // ==================================================
    // HAPUS FIELD LAMA
    // ==================================================

    delete user.trading.position;

    delete user.trading.buyPrice;
}


// ==================================================
// MAIN HANDLER
// ==================================================

let handler = async (
    m,
    {
        usedPrefix,
        text
    }
) => {

    const user =
        global.db.data.users[
            m.sender
        ];


    if (!user) {

        return m.reply(
            '❌ Data user belum tersedia.'
        );
    }


    initUser(user);


    // ==================================================
    // LOAD MARKET
    // ==================================================

    const market =
        loadMarket();


    // ==================================================
    // UPDATE MARKET
    // ==================================================

    const changed =
        updateMarket(
            market
        );


    if (changed) {

        saveMarket(
            market
        );
    }


    // ==================================================
    // PARSE COMMAND
    // ==================================================

    const args =
        text
            ? text
                .trim()
                .split(/\s+/)
            : [];


    const action =
        args[0]
            ? args[0].toLowerCase()
            : '';


    const value =
        args[1]
            ? args[1].toLowerCase()
            : '';


    // ==================================================
    // MENU
    // ==================================================

    if (!action) {

        return m.reply(
            tradingMenu(
                usedPrefix
            )
        );
    }


    // ==================================================
    // CEK
    // ==================================================

    if (
        action === 'cek' ||
        action === 'check' ||
        action === 'market'
    ) {

        return m.reply(
            tradingCheck(
                user,
                market
            )
        );
    }


    // ==================================================
    // BUY
    // ==================================================

    if (
        action === 'buy'
    ) {

        let moneyAmount;


        // ==================================================
        // BUY ALL
        // ==================================================

        if (
            value === 'all'
        ) {

            if (
                user.money <= 0
            ) {

                return m.reply(
                    `❌ *BUY GAGAL*\n\n` +
                    `Money kamu tidak mencukupi.\n\n` +
                    `Money : ${formatMoney(user.money)}`
                );
            }


            moneyAmount =
                Math.floor(
                    user.money
                );
        }


        // ==================================================
        // BUY NOMINAL
        // ==================================================

        else {

            moneyAmount =
                parseAmount(
                    value
                );


            if (
                moneyAmount <= 0
            ) {

                return m.reply(
                    `❌ Jumlah buy tidak valid.\n\n` +
                    `Contoh:\n` +
                    `${usedPrefix}trading buy 50000\n` +
                    `${usedPrefix}trading buy all`
                );
            }


            if (
                moneyAmount <
                MIN_TRADE
            ) {

                return m.reply(
                    `❌ Minimal buy ${formatMoney(MIN_TRADE)}.`
                );
            }


            if (
                user.money <
                moneyAmount
            ) {

                return m.reply(
                    `❌ *BUY GAGAL*\n\n` +
                    `Money kamu   : ${formatMoney(user.money)}\n` +
                    `Dibutuhkan   : ${formatMoney(moneyAmount)}`
                );
            }
        }


        // ==================================================
        // VALIDASI BUY
        // ==================================================

        if (
            moneyAmount <
            MIN_TRADE
        ) {

            return m.reply(
                `❌ Minimal buy ${formatMoney(MIN_TRADE)}.`
            );
        }


        // ==================================================
        // HARGA MARKET
        // ==================================================

        const buyPrice =
            market.price;


        // ==================================================
        // COIN DIDAPAT
        // ==================================================
        //
        // Money / harga market
        //
        // Contoh:
        //
        // Money = 71.598.833.017
        // Harga = 10.751
        //
        // Coin bisa menjadi:
        //
        // 6.659.737,05
        //
        // Database tetap menyimpan
        // angka presisi.
        // ==================================================

        const coinBought =
            moneyAmount /
            buyPrice;


        // ==================================================
        // DATA LAMA
        // ==================================================

        const oldCoin =
            user.trading.coin;


        const oldInvested =
            user.trading.totalInvested;


        // ==================================================
        // DATA BARU
        // ==================================================

        const newCoin =
            oldCoin +
            coinBought;


        const newInvested =
            oldInvested +
            moneyAmount;


        // ==================================================
        // AVG BUY
        // ==================================================

        const newAvgBuy =
            newCoin > 0
                ? newInvested /
                    newCoin
                : buyPrice;


        // ==================================================
        // SIMPAN
        // ==================================================

        user.trading.coin =
            newCoin;


        user.trading.totalInvested =
            newInvested;


        user.trading.avgBuy =
            newAvgBuy;


        // ==================================================
        // POTONG MONEY
        // ==================================================

        user.money -=
            moneyAmount;


        if (
            user.money < 0.01
        ) {

            user.money = 0;
        }


        user.trading.lastAction =
            Date.now();


        await global.db.write();


        // ==================================================
        // CURRENT VALUE
        // ==================================================

        const currentValue =
            getPositionValue(
                user.trading.coin,
                market.price
            );


        const profit =
            currentValue -
            user.trading.totalInvested;


        const profitPercent =
            calculatePositionPercent(
                user.trading.avgBuy,
                market.price
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        return m.reply(
            `📈 *BUY BANKKE BERHASIL*\n\n` +

            `Harga market : ${formatMoney(buyPrice)}\n` +
            `Modal buy    : ${formatMoney(moneyAmount)}\n` +
            `Coin didapat : ${formatCoin(coinBought)}\n\n` +

            `Total coin   : ${formatCoin(user.trading.coin)}\n` +
            `Avg Buy      : ${formatMoney(user.trading.avgBuy)}\n` +
            `Nilai        : ${formatMoney(currentValue)}\n\n` +

            `${formatProfit(profit)}\n` +
            `P/L %        : ${formatPercent(profitPercent)}\n\n` +

            `Money        : ${formatMoney(user.money)}`
        );
    }


    // ==================================================
    // SELL
    // ==================================================

    if (
        action === 'sell'
    ) {

        // ==================================================
        // CEK COIN
        // ==================================================

        if (
            user.trading.coin <= 0
        ) {

            return m.reply(
                `❌ *SELL GAGAL*\n\n` +
                `Kamu belum memiliki coin BANKKE.\n\n` +
                `Gunakan:\n` +
                `${usedPrefix}trading buy 50000`
            );
        }


        let coinToSell;


        // ==================================================
        // SELL ALL
        // ==================================================

        if (
            value === 'all'
        ) {

            coinToSell =
                user.trading.coin;
        }


        // ==================================================
        // SELL NOMINAL
        // ==================================================

        else {

            const sellMoney =
                parseAmount(
                    value
                );


            if (
                sellMoney <= 0
            ) {

                return m.reply(
                    `❌ Jumlah sell tidak valid.\n\n` +
                    `Contoh:\n` +
                    `${usedPrefix}trading sell 50000\n` +
                    `${usedPrefix}trading sell all`
                );
            }


            if (
                sellMoney <
                MIN_TRADE
            ) {

                return m.reply(
                    `❌ Minimal sell ${formatMoney(MIN_TRADE)}.`
                );
            }


            /*
             * Nominal money dikonversi
             * menjadi coin.
             */

            coinToSell =
                sellMoney /
                market.price;


            if (
                coinToSell >
                user.trading.coin
            ) {

                return m.reply(
                    `❌ *SELL GAGAL*\n\n` +
                    `Nilai coin kamu : ${formatMoney(getPositionValue(user.trading.coin, market.price))}\n` +
                    `Mau dijual       : ${formatMoney(sellMoney)}`
                );
            }
        }


        // ==================================================
        // VALIDASI
        // ==================================================

        if (
            coinToSell <= 0
        ) {

            return m.reply(
                `❌ Coin yang dijual tidak valid.`
            );
        }


        if (
            coinToSell >
            user.trading.coin
        ) {

            coinToSell =
                user.trading.coin;
        }


        // ==================================================
        // SELL PRICE
        // ==================================================

        const sellPrice =
            market.price;


        // ==================================================
        // SELL VALUE
        // ==================================================

        const sellValue =
            coinToSell *
            sellPrice;


        // ==================================================
        // COST BASIS
        // ==================================================

        const costBasis =
            coinToSell *
            user.trading.avgBuy;


        // ==================================================
        // PROFIT / LOSS
        // ==================================================

        const profit =
            sellValue -
            costBasis;


        const profitPercent =
            calculatePositionPercent(
                user.trading.avgBuy,
                sellPrice
            );


        // ==================================================
        // KURANGI COIN
        // ==================================================

        user.trading.coin -=
            coinToSell;


        // ==================================================
        // KURANGI INVESTASI
        // ==================================================

        user.trading.totalInvested -=
            costBasis;


        if (
            user.trading.totalInvested <
            0.01
        ) {

            user.trading.totalInvested = 0;
        }


        // ==================================================
        // MONEY MASUK
        // ==================================================

        user.money +=
            sellValue;


        // ==================================================
        // RESET POSISI
        // ==================================================

        if (
            user.trading.coin <
            0.00000001
        ) {

            user.trading.coin = 0;
        }


        if (
            user.trading.coin === 0
        ) {

            user.trading.avgBuy = 0;

            user.trading.totalInvested = 0;
        }


        user.trading.lastAction =
            Date.now();


        await global.db.write();


        // ==================================================
        // REMAINING VALUE
        // ==================================================

        const remainingValue =
            getPositionValue(
                user.trading.coin,
                market.price
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        return m.reply(
            `💰 *SELL BANKKE BERHASIL*\n\n` +

            `Harga market : ${formatMoney(sellPrice)}\n` +
            `Coin dijual  : ${formatCoin(coinToSell)}\n` +
            `Hasil sell   : ${formatMoney(sellValue)}\n\n` +

            `${formatProfit(profit)}\n` +
            `P/L %        : ${formatPercent(profitPercent)}\n\n` +

            `Sisa coin    : ${formatCoin(user.trading.coin)}\n` +
            `Nilai posisi : ${formatMoney(remainingValue)}\n` +
            `Money        : ${formatMoney(user.money)}`
        );
    }


    // ==================================================
    // UNKNOWN COMMAND
    // ==================================================

    return m.reply(
        tradingMenu(
            usedPrefix
        )
    );
};


// ==================================================
// MENU
// ==================================================

function tradingMenu(prefix) {

    return `
📊 *BANKKE TRADING*

• ${prefix}trading cek
• ${prefix}trading buy <jumlah/all>
• ${prefix}trading sell <jumlah/all>

Contoh:

${prefix}trading cek
${prefix}trading buy 50000
${prefix}trading buy all
${prefix}trading sell 50000
${prefix}trading sell all
`.trim();
}


// ==================================================
// TRADING CHECK
// ==================================================

function tradingCheck(
    user,
    market
) {

    // ==================================================
    // MARKET CHANGE
    // ==================================================

    const change =
        calculateChange(
            market.previousPrice,
            market.price
        );


    // ==================================================
    // TREND
    // ==================================================

    let trend;


    if (
        change >= 2
    ) {

        trend =
            'BULLISH 🟢';

    } else if (
        change <= -2
    ) {

        trend =
            'BEARISH 🔴';

    } else {

        trend =
            'SIDEWAYS 🟡';
    }


    // ==================================================
    // PORTFOLIO
    // ==================================================

    let positionInfo;


    if (
        user.trading.coin <= 0
    ) {

        positionInfo =
            `💼 *POSISI KAMU*\n\n` +
            `Belum memiliki coin BANKKE.`;

    } else {

        const positionValue =
            getPositionValue(
                user.trading.coin,
                market.price
            );


        const profit =
            positionValue -
            user.trading.totalInvested;


        const profitPercent =
            calculatePositionPercent(
                user.trading.avgBuy,
                market.price
            );


        positionInfo =
            `💼 *POSISI KAMU*\n\n` +

            `Coin        : ${formatCoin(user.trading.coin)}\n` +
            `Modal       : ${formatMoney(user.trading.totalInvested)}\n` +
            `Avg Buy     : ${formatMoney(user.trading.avgBuy)}\n` +
            `Harga       : ${formatMoney(market.price)}\n` +
            `Nilai       : ${formatMoney(positionValue)}\n\n` +

            `P/L         : ${formatProfitShort(profit)}\n` +
            `P/L %       : ${formatPercent(profitPercent)}`;
    }


    // ==================================================
    // CHART
    // ==================================================

    const chart =
        makeChart(
            market.history
        );


    // ==================================================
    // RESULT
    // ==================================================

    return `
📊 *BANKKE MARKET*

Harga       : ${formatMoney(market.price)}
Sebelumnya  : ${formatMoney(market.previousPrice)}
Perubahan   : ${formatPercent(change)}
Trend       : ${trend}

📈 CHART

${chart}

${positionInfo}

💰 Money    : ${formatMoney(user.money)}
`.trim();
}


// ==================================================
// POSITION VALUE
// ==================================================

function getPositionValue(
    coin,
    currentPrice
) {

    if (
        coin <= 0 ||
        currentPrice <= 0
    ) {

        return 0;
    }


    return (
        coin *
        currentPrice
    );
}


// ==================================================
// POSITION PERCENT
// ==================================================

function calculatePositionPercent(
    avgBuy,
    currentPrice
) {

    if (
        !isFinite(avgBuy) ||
        !isFinite(currentPrice) ||
        avgBuy <= 0
    ) {

        return 0;
    }


    return (
        (
            currentPrice -
            avgBuy
        ) /
        avgBuy
    ) *
    100;
}


// ==================================================
// PROFIT
// ==================================================

function formatProfit(
    profit
) {

    if (
        profit > 0
    ) {

        return (
            `Profit       : +${formatMoney(profit)} 📈`
        );
    }


    if (
        profit < 0
    ) {

        return (
            `Loss         : -${formatMoney(Math.abs(profit))} 📉`
        );
    }


    return (
        `Profit/Loss  : Rp0 ➖`
    );
}


// ==================================================
// SHORT PROFIT
// ==================================================

function formatProfitShort(
    profit
) {

    if (
        profit > 0
    ) {

        return (
            `+${formatMoney(profit)} 📈`
        );
    }


    if (
        profit < 0
    ) {

        return (
            `-${formatMoney(Math.abs(profit))} 📉`
        );
    }


    return 'Rp0 ➖';
}


// ==================================================
// CHART
// ==================================================

function makeChart(history) {

    const CHART_WIDTH =
        30;


    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        return (
            '┌' +
            '─'.repeat(CHART_WIDTH) +
            '┐\n' +

            '│' +
            '▄'.repeat(CHART_WIDTH) +
            '│\n' +

            '└' +
            '─'.repeat(CHART_WIDTH) +
            '┘'
        );
    }


    const chars = [
        '▁',
        '▂',
        '▃',
        '▄',
        '▅',
        '▆',
        '▇',
        '█'
    ];


    // ==================================================
    // AMBIL 30 DATA TERAKHIR
    // ==================================================

    let data =
        history.slice(
            -CHART_WIDTH
        );


    // ==================================================
    // PAD KIRI
    // ==================================================

    while (
        data.length <
        CHART_WIDTH
    ) {

        data.unshift(
            data[0]
        );
    }


    // ==================================================
    // MIN MAX
    // ==================================================

    const min =
        Math.min(
            ...data
        );


    const max =
        Math.max(
            ...data
        );


    let chart = '';


    // ==================================================
    // HARGA SAMA
    // ==================================================

    if (
        min === max
    ) {

        chart =
            '▄'.repeat(
                CHART_WIDTH
            );

    } else {

        // ==================================================
        // NORMALIZE CHART
        // ==================================================

        for (
            const price of data
        ) {

            const ratio =
                (
                    price -
                    min
                ) /
                (
                    max -
                    min
                );


            let index =
                Math.round(
                    ratio *
                    (
                        chars.length - 1
                    )
                );


            index =
                clamp(
                    index,
                    0,
                    chars.length - 1
                );


            chart +=
                chars[index];
        }
    }


    // ==================================================
    // FINAL BOX
    // ==================================================

    return (
        '┌' +
        '─'.repeat(
            CHART_WIDTH
        ) +
        '┐\n' +

        '│' +
        chart +
        '│\n' +

        '└' +
        '─'.repeat(
            CHART_WIDTH
        ) +
        '┘'
    );
}


// ==================================================
// PARSE AMOUNT
// ==================================================

function parseAmount(value) {

    if (!value) {

        return 0;
    }


    let text =
        String(value)
            .toLowerCase()
            .replace(
                /\s/g,
                ''
            )
            .replace(
                /^rp/,
                ''
            );


    let multiplier = 1;


    // ==================================================
    // JT
    // ==================================================

    if (
        text.endsWith('jt')
    ) {

        multiplier =
            1000000;

        text =
            text.slice(
                0,
                -2
            );

    }


    // ==================================================
    // M
    // ==================================================

    else if (
        text.endsWith('m')
    ) {

        multiplier =
            1000000;

        text =
            text.slice(
                0,
                -1
            );

    }


    // ==================================================
    // K
    // ==================================================

    else if (
        text.endsWith('k')
    ) {

        multiplier =
            1000;

        text =
            text.slice(
                0,
                -1
            );
    }


    // ==================================================
    // DECIMAL
    // ==================================================

    text =
        text.replace(
            /,/g,
            '.'
        );


    const number =
        parseFloat(
            text
        );


    if (
        !isFinite(number) ||
        number <= 0
    ) {

        return 0;
    }


    return Math.floor(
        number *
        multiplier
    );
}


// ==================================================
// FORMAT MONEY
// ==================================================

function formatMoney(number) {

    if (
        !isFinite(number) ||
        number <= 0
    ) {

        return 'Rp0';
    }


    return (
        'Rp' +
        Math.floor(
            number
        ).toLocaleString(
            'id-ID'
        )
    );
}


// ==================================================
// FORMAT COIN
// ==================================================
//
// Database tetap presisi.
// Tampilan maksimal 2 angka desimal.
//
// Contoh:
//
// 6659737.04929774
// → 6659737.05
//
// 2.500000
// → 2.5
//
// 10
// → 10
// ==================================================

function formatCoin(number) {

    if (
        !isFinite(number) ||
        number <= 0
    ) {

        return '0';
    }


    const rounded =
        Number(
            number.toFixed(2)
        );


    return rounded
        .toLocaleString(
            'en-US',
            {
                useGrouping: false,
                maximumFractionDigits: 2
            }
        );
}


// ==================================================
// FORMAT PERCENT
// ==================================================

function formatPercent(number) {

    if (
        !isFinite(number)
    ) {

        return '0.00%';
    }


    const sign =
        number > 0
            ? '+'
            : '';


    return (
        sign +
        number.toFixed(2) +
        '%'
    );
}


// ==================================================
// CALCULATE MARKET CHANGE
// ==================================================

function calculateChange(
    oldPrice,
    newPrice
) {

    if (
        !isFinite(oldPrice) ||
        !isFinite(newPrice) ||
        oldPrice <= 0
    ) {

        return 0;
    }


    return (
        (
            newPrice -
            oldPrice
        ) /
        oldPrice
    ) *
    100;
}


// ==================================================
// RANDOM NORMAL
// ==================================================
//
// Gaussian distribution.
// Sebagian besar noise kecil,
// perubahan ekstrem lebih jarang.
// ==================================================

function randomNormal() {

    let u = 0;
    let v = 0;


    while (
        u === 0
    ) {

        u =
            Math.random();
    }


    while (
        v === 0
    ) {

        v =
            Math.random();
    }


    return Math.sqrt(
        -2 *
        Math.log(u)
    ) *
    Math.cos(
        2 *
        Math.PI *
        v
    );
}


// ==================================================
// RANDOM BETWEEN
// ==================================================

function randomBetween(
    min,
    max
) {

    return (
        Math.random() *
        (
            max -
            min
        )
    ) +
    min;
}


// ==================================================
// CLAMP
// ==================================================

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );
}


// ==================================================
// HANDLER SETTINGS
// ==================================================

handler.help = [
    'trading'
];

handler.tags = [
    'rpg'
];

handler.command =
    /^(trading)$/i;

handler.disabled = false;

handler.rpg = true;


// Limit ditangani loader utama.
handler.limit = false;


export default handler;