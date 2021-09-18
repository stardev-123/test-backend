/**
 * Created by laslo on 26.12.18..
 */

const util = require('../lib/util')

const coinBackgrounds = {
  BTC: '#00DCA3',
  ETH: '#FFC000',
  BCH: '#FF7558',
  LTC: '#9100FF',
  XLM: '#16A085',
  ETC: '#3687FF',
  ZEC: '#14B9D6'
}

const getCoinRow = ({ currency, amount, price, volume }) => {
  return `<tr>` +
        `<td align="left" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top; padding-left: 0;" valign="top">` +
        `<span class="point" style="display: inline-block; width: 8px; height: 8px; border-radius: 8px; background: ${coinBackgrounds[currency]}; margin-right: 2px;"></span>` +
        `${currency}` +
        `</td>` +
        `<td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top;" valign="top"> ${price}` +
        `</td>` +
        `<td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top;" valign="top"> ${volume}` +
        `</td>` +
        `<td align="right" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top; padding-right: 0;" valign="top">$${util.format(amount, 2)}</td>` +
        `</tr>`
}

exports.returnCoinTable = (list, total) => {
  const htmlList = list.map(row => getCoinRow(row)).join('')
  return `<div class="bill-contanter" style="box-sizing: border-box; max-width: 353px; background: #EEEFF2; border-radius: 5px; margin: 20px auto; padding: 10px;">` +
        `<table style="box-sizing: border-box; border-collapse: separate !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">` +
        `<thead style="color: #7A80A3; font-size: 16px;">` +
        `<tr>` +
        `<th align="left" style="padding-bottom: 10px; font-weight: normal; padding-left: 0;">Coin</th>` +
        `<th style="padding-bottom: 10px; font-weight: normal;">Market</th>` +
        `<th style="padding-bottom: 10px; font-weight: normal;">Amount</th>` +
        `<th align="right" style="padding-bottom: 10px; font-weight: normal; padding-right: 0;">Price</th>` +
        `</tr>` +
        `</thead>` +
        `<tbody>` +
        htmlList +
        `</tbody>` +
        `<tfoot style="color: #7A80A3;">` +
        `<tr>` +
        `<td colspan="4" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; vertical-align: top; font-size: 16px; border-top: 1px solid #D8D8D8; padding-top: 10px; padding-left: 0; padding-right: 0;" valign="top">` +
        `<span class="total" style="display: inline-block; float: left;">Total</span>` +
        `<span class="price" style="display: inline-block; float: right; color: #131C4F; font-weight: bold;">$${util.format(total, 2)}</span>` +
        `</td>` +
        `</tr>` +
        `</tfoot>` +
        `</table>` +
        `</div>`
}
