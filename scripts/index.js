/**
 * Created by laslo on 09/10/18.
 */

module.exports.INSERT_MISSING_COIN =
    'INSERT INTO PortfolioInvestments (name,percent,currency,userId,createdAt,updatedAt) select #NAME, 0, #CODE, u.id, NOW(), NOW() from users as u where u.id not in (select pei.userId from PortfolioInvestments as pei where currency = #CODE)'

module.exports.RETURN_USER_HOLDINGS =
    "SELECT w.currency, w.amount, w.pending, coalesce(p.price,0) price, (case when w.currency = 'USD' then w.amount else w.amount * coalesce(p.price,0) end ) value FROM wallets w left join priceHistories p on p.currency = w.currency and p.date = DATE(NOW()) where w.userId = ? "

module.exports.RETURN_USER_HOLDINGS_TOTAL =
    'SELECT SUM(w.amount * coalesce(p.price,0)) value FROM wallets w left join priceHistories p on p.currency = w.currency and p.date = DATE(NOW()) where w.userId = ? '

module.exports.RETURN_USER_HOLDINGS_TOTAL_ON_DAY =
    'SELECT SUM(w.amount * coalesce(p.price,0)) value FROM wallets w left join priceHistories p on p.currency = w.currency and p.date = DATE(?) where w.userId = ? '

module.exports.RETURN_USER_HOLDINGS_TOTAL_ON_HOUR =
    'SELECT SUM(w.amount * coalesce(p.price,0)) value FROM wallets w left join priceHourlyHistories p on p.currency = w.currency and p.time = ? where w.userId = ? '

module.exports.RETURN_USER_HOLDINGS_HISTORY =
    'SELECT UNIX_TIMESTAMP(p.date)*1000 time, sum(w.amount * coalesce(p.price,0)) as value FROM wallets w left join priceHistories p on p.currency = w.currency and p.date >= DATE(DATE_SUB(NOW(), INTERVAL ? DAY)) where w.userId = ? and p.date is not null group by p.date order by p.date'

module.exports.RETURN_USER_HOLDINGS_HOURLY_HISTORY =
    'SELECT p.time*1000 time, sum(w.amount * coalesce(p.price,0)) as value FROM wallets w left join priceHourlyHistories p on p.currency = w.currency and p.time > ? where w.userId = ? and p.time is not null group by p.time order by p.time'

module.exports.RETURN_USER_ACCOUNTS_DATA =
    'SELECT b.id, b.name, b.mask, b.type, b.subtype, b.primary, i.name as institution FROM bankAccounts b inner join institutions i on i.id = b.institutionId where b.active = 1 and b.userId = ?'
