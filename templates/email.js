const config = require('../config')

const logoUrl = config.serverUrl + 'assets/logo.png'
const emailUrl = config.serverUrl + 'assets/email.png'
const worldUrl = config.serverUrl + 'assets/world.png'

const template =
    `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Simple Transactional Email</title>
<style media="all" type="text/css">
@media only screen and (max-width: 690px) {
  table[class=body] h1,
  table[class=body] h2,
  table[class=body] h3,
  table[class=body] h4 {
    font-weight: 600 !important;
  }
  table[class=body] h1 {
    font-size: 22px !important;
  }
  table[class=body] h2 {
    font-size: 18px !important;
  }
  table[class=body] h3 {
    font-size: 16px !important;
  }
  table[class=body] .content,
  table[class=body] .wrapper {
    padding: 10px !important;
  }
  table[class=body] .container {
    padding: 0 !important;
    width: 100% !important;
  }
  table[class=body] .btn table,
  table[class=body] .btn a {
    width: 100% !important;
  }
  table[class=body] .unsubscribe {
    padding: 0 20px !important;
  }
  table[class=body] .wrapper-body {
    padding: 10px !important;
  }
  table[class=body] .wrapper-footer {
    padding: 20px !important;
  }
  table[class=body] .wrapper-footer .left, table[class=body] .wrapper-footer .right {
    display: block !important;
    width: 100% !important;
    margin: 5px 0;
  }
  table[class=body] .wrapper-footer .right, table[class=body] .wrapper-footer .center {
    text-align: left !important;
  }
}
</style>
</head>

<body style="margin: 0; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; font-size: 14px; height: 100% !important; line-height: 1.6em; -webkit-font-smoothing: antialiased; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; width: 100% !important; background-color: #EEEEEE;">

<table class="body" style="box-sizing: border-box; border-collapse: separate !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #EEEEEE;" width="100%" bgcolor="#EEEEEE">
  <tr>
    <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top;" valign="top"></td>
    <td class="container" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;" width="650" valign="top">
      <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">
<table class="main" style="box-sizing: border-box; border-collapse: separate !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-radius: 3px;" width="100%">
  <tr>
    <td class="wrapper" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top; padding: 30px; padding-bottom: 0;" valign="top">
      <table class="body" style="box-sizing: border-box; border-collapse: separate !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #EEEEEE;" width="100%" bgcolor="#EEEEEE">
        <tr>
          <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top;" valign="top">
            <div class="logo-dark-bg" style="box-sizing: border-box; background: #131c4f;"><div class="logo" style="box-sizing: border-box; text-align: center; height: 73px; padding-top: 16px;">
  <img src="${logoUrl}" alt="logo" style="-ms-interpolation-mode: bicubic; max-width: 100%; width: 150px;" width="150">
</div></div>
            <div class="wrapper-body" style="box-sizing: border-box; background: #ffffff; text-align: center; padding: 35px 50px;">
              <h1 class="title confirm-title" style="text-transform: capitalize; font-size: 20px; margin: 10px 0 !important; color: #111111 !important; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-weight: 400; line-height: 1.4em; margin-bottom: 30px;">
                #TITLE
              </h1>
              <p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                #BODY
              </p>
              #LINK
            </div>
            <div class="wrapper-footer" style="box-sizing: border-box; background: #F5F5F5; padding: 30px;">
              <div class="center" style="box-sizing: border-box; text-align: center;">
                <div class="concat" style="box-sizing: border-box;">
                  <div class="e-mail" style="box-sizing: border-box; margin-bottom: 10px;">
                    <img src="${emailUrl}" alt="e-mail" style="-ms-interpolation-mode: bicubic; max-width: 100%; width: 16px; margin-right: 5px; vertical-align: middle;" width="16">
                    support@onrampinvest.com
                  </div>
                  <div class="word" style="box-sizing: border-box; margin-bottom: 10px;">
                    <img src="${worldUrl}" alt="world" style="-ms-interpolation-mode: bicubic; max-width: 100%; width: 16px; margin-right: 5px; vertical-align: middle;" width="16">
                    www.onrampinvest.com
                  </div>
                </div>                <div class="copyright" style="box-sizing: border-box; color: rgba(19, 28, 79, 0.7);">
                  <p style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-weight: normal; margin-bottom: 15px; margin: 0; font-size: 12px;">Onramp<sup>TM</sup> and SpareChange<sup>TM</sup> are</p>
                  <p style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-weight: normal; margin-bottom: 15px; margin: 0; font-size: 12px;">trademarks of Reality Shares Inc.</p>
                </div>              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</div>
    </td>
    <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; vertical-align: top;" valign="top"></td>
  </tr>
</table>

</body>
</html>
`

module.exports = template
