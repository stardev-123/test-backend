/**
 * Created by laslo on 13/11/18.
 */

const util = require('../util')
const coins = require('../../templates/coins')

const EVENTS = {
  ADMIN_EVENT: 'admin_event',
  EMAIL_CONFIRMATION: 'email_confirmation',
  CONFIRMATION_PAGE: 'confirmation_page',
  FIRST_EMAIL_REGISTRATION: 'first_email_registration',
  FORGOT_PASSWORD: 'forgot_password',
  GENERATED_NEW_PASSWORD: 'generated_new_password',
  FIRST_INVESTMENT: 'first_investment',
  SIGNUP_SPARECHANGE: 'signup_sparechange',
  SIGNUP_RECURRING: 'signup_recurring',
  EDIT_RECURRING: 'edit_recurring',
  CANCEL_SPARECHANGE: 'cancel_sparechange',
  CANCEL_RECURRING: 'cancel_recurring',
  ADD_FUNDS_COMPLETED: 'add_funds_completed',
  CONFIRM_NEW_INVESTMENT: 'confirm_new_investment',
  CONFIRM_SALE_OF_CRYPTO: 'confirm_sale_of_crypto',
  WITHDRAWAL_OF_FUNDS: 'withdrawal_of_funds',
  INSUFFICIENT_FUND_FOR_SPARECHANGE: 'insufficient_fund_for_sparechange',
  INSUFFICIENT_FUND_FOR_RECURRING: 'insufficient_fund_for_recurring',
  INVESTMENT_FAILED: 'investment_failed',
  NOTIFY_FOR_SPARECHANGE: 'notify_for_sparechange',
  NOTIFY_FOR_RECURRING: 'notify_for_recurring',
  NOT_IN_WHITELIST: 'not_in_whitelist',
  CUSTOMER_INVESTMENT_CREATED: 'customer_transfer_created',
  CUSTOMER_INVESTMENT_CANCELLED: 'customer_transfer_cancelled',
  CUSTOMER_INVESTMENT_FAILED: 'customer_transfer_failed',
  CUSTOMER_INVESTMENT_COMPLETED: 'customer_investment_completed',
  CUSTOMER_WITHDRAW_CREATED: 'customer_withdraw_created',
  CUSTOMER_WITHDRAW_CANCELLED: 'customer_withdraw_cancelled',
  CUSTOMER_WITHDRAW_COMPLETED: 'customer_withdraw_completed',
  CUSTOMER_WITHDRAW_FAILED: 'customer_withdraw_failed',
  CUSTOMER_INVESTMENT_CREATED_RS: 'customer_transfer_created_rs',
  CUSTOMER_INVESTMENT_CANCELLED_RS: 'customer_transfer_cancelled_rs',
  CUSTOMER_INVESTMENT_FAILED_RS: 'customer_transfer_failed_rs',
  CUSTOMER_INVESTMENT_COMPLETED_RS: 'customer_investment_completed_rs',
  CUSTOMER_WITHDRAW_CREATED_RS: 'customer_withdraw_created_rs',
  CUSTOMER_WITHDRAW_CANCELLED_RS: 'customer_withdraw_cancelled_rs',
  CUSTOMER_WITHDRAW_COMPLETED_RS: 'customer_withdraw_completed_rs',
  CUSTOMER_WITHDRAW_FAILED_RS: 'customer_withdraw_failed_rs',
  CUSTOMER_FUNDING_SOURCE_ADDED: 'customer_funding_source_added',
  CUSTOMER_FUNDING_SOURCE_REMOVED: 'customer_funding_source_removed',
  CUSTOMER_FUNDING_SOURCE_VERIFIED: 'customer_funding_source_verified',
  CUSTOMER_CREATED: 'customer_created',
  CUSTOMER_SUSPENDED: 'customer_suspended',
  CUSTOMER_VERIFIED: 'customer_verified',
  CUSTOMER_VERIFICATION_DOCUMENT_NEEDED: 'customer_verification_document_needed',
  CUSTOMER_VERIFICATION_DOCUMENT_UPLOADED: 'customer_verification_document_uploaded',
  CUSTOMER_VERIFICATION_DOCUMENT_FAILED: 'customer_verification_document_failed',
  CUSTOMER_VERIFICATION_DOCUMENT_APPROVED: 'customer_verification_document_approved',
  INVITATION: 'invitation'
}

const _generateHtmlAssetsList = (list, amount) => {
  return coins.returnCoinTable(list, amount)
}

const _generateCardsList = (cardList) => {
  let html = `<ul style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; padding: 0; color: #131C4F;">`
  cardList.forEach(({ name, mask }) => {
    html += html += `<li class="item" style="list-style-position: inside; margin-left: 5px; margin: 25px 0;">` +
        `<span class="light" style="color: #7A7EA6;">${name}</span> ● ● ● ● ${mask}` +
        `</li>`
  })
  html += `</ul>`
  return html
}

const NOTIFICATIONS = {
}

NOTIFICATIONS[EVENTS.ADMIN_EVENT] = {
  emailData: {
    subject: 'ONRAMP CRITICAL ERROR ALERT',
    title: '',
    body: ({ req, event, payload }) =>
      `<div>ERROR event: ${event} occured for Request: ${req.api_id} at ${new Date()}.` +
      `<br/> ` +
      `<br/> Payload: ${JSON.stringify(payload)}` +
      `</div>`
  }
}

NOTIFICATIONS[EVENTS.EMAIL_CONFIRMATION] = {
  emailData: {
    subject: 'Confirm your email',
    title: 'Confirm your email',
    body: `Hey #FIRST_NAME #LAST_NAME, please confirm your email by clicking on the confirmation button.`,
    link: (link) => `<a class="link btn-link" href="${link}" style="box-sizing: border-box; text-decoration: none; font-size: 16px; color: #131C4F; display: inline-block; width: 195px; height: 50px; line-height: 50px; border-radius: 4px; background: #00EEAD;">Confirm Email</a>`
  }
}

NOTIFICATIONS[EVENTS.FIRST_EMAIL_REGISTRATION] = {
  emailData: {
    subject: 'Welcome to Onramp',
    title: 'Welcome to Onramp',
    body: `Welcome email text here`
  }
}

NOTIFICATIONS[EVENTS.CONFIRMATION_PAGE] = {
  emailData: {
    subject: '',
    title: '',
    body: `You successfully confirmed your email`
  }
}

NOTIFICATIONS[EVENTS.FIRST_INVESTMENT] = {
  emailData: {
    subject: "Congrats! You've made your first investment.",
    title: "Congrats! You've made your first investment.",
    body: ({ investments, amount }) => {
      const htmlList = _generateHtmlAssetsList(investments, amount)
      return `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
                `You're so cool! You're now officially an Onramp cryptocurrency investor, joining other savvy digital` +
                `currency investors.` +
              `</p>` +
              `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
                `Here's what your first investment looks like:` +
              `</p>` +
        `${htmlList}` +
        `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">Now take the next step in building your investment by signing up for SpareChange.</p>` +
        `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
        `<span class="strong" style="color: #131C4F;">IMPORTANT:</span> While we've gone ahead and funded your <br> investment, you will not be able to sell any holdings or withdraw <br> funds until your bank fund transfer is confirmed, usually within 1-2 <br> business days.` +
        `</p>` +
        `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">Your Onramp account is protected against fraud and hackers by bank-level security measures. Read all about how we secure your account <a href="#" class="normal-link" style="box-sizing: border-box; color: #2F61D5; text-decoration: none;">here</a>.</p>` +
        `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">If you did not take this action in the app <a href="#" class="normal-link" style="box-sizing: border-box; color: #2F61D5; text-decoration: none;">fraud link</a></p>`
    }
  },
  pushData: {
    conditional: true,
    title: "You've Got Crypto",
    body: "Congrats! Your transaction is completed. Let's check it out."
  }
}

NOTIFICATIONS[EVENTS.SIGNUP_SPARECHANGE] = {
  emailData: {
    subject: 'SpareChange(TM) signup complete',
    title: 'SpareChange(TM) signup complete',
    body: (cardList) => {
      const htmlList = _generateCardsList(cardList)
      return `<div>You’re one smart cookie! You've successfully added SpareChange credit card round-ups to your Onramp account. Every month, we'll check the card(s) you've connected, and round up the change of each transaction into an automatic new investment in Onramp. This amount will be pulled from your connected bank account. Onramp will NEVER charge your credit card(s).</div><div>You can change or cancel SpareChange investments anytime in the "Boosts" section of your Onramp app.<div>${htmlList}`
    }
  }
}

NOTIFICATIONS[EVENTS.SIGNUP_RECURRING] = {
  emailData: {
    subject: 'Recurring investment signup complete',
    title: 'Recurring investment signup complete',
    body: (amount) => `<div>Great job! You've successfully added a $${util.format(amount, 2)} recurring investment to your Onramp account. Every month, we'll transfer that amount from your bank and make an automatic new cryptocurrency investment in Onramp. Onramp will NEVER overdraft your bank account.</div><div>You can change or cancel Recurring investments anytime in the "Boosts" section of your Onramp app.</div>`
  }
}

NOTIFICATIONS[EVENTS.EDIT_RECURRING] = {
  emailData: {
    subject: 'Recurring investment edit complete',
    title: 'Recurring investment edit complete',
    body: (amount) => `<div>You've successfully edited your recurring investment to $${util.format(amount, 2)} a month.. Every month, we'll transfer that amount from your bank and make an automatic new cryptocurrency investment in Onramp. Onramp will NEVER overdraft your bank account.</div><div>You can change or cancel Recurring investments anytime in the "Boosts" section of your Onramp app.</div>`
  }
}

NOTIFICATIONS[EVENTS.ADD_FUNDS_COMPLETED] = {
  emailData: {
    subject: 'Funds Added',
    title: 'Funds Added',
    body: (amount) => `<div>Woot! You've successfully added $${util.format(amount, 2)} to your Onramp investment app from your bank account. Funds are immediately reflected in your cash balance and can now be used to make additional investments, BUT these funds cannot be withdrawn until the transfer is confirmed by your bank (usually within 1-2 bussiness days). </div>`
  }
}

NOTIFICATIONS[EVENTS.CONFIRM_NEW_INVESTMENT] = {
  emailData: {
    subject: "You've added to your portfolio",
    title: "You've added to your portfolio",
    body: ({ investments, amount }) => {
      const htmlList = _generateHtmlAssetsList(investments, amount)
      return `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
                `Awesome! You've just added to your Onramp cryptocurrency portfolio. Your latest transaction is reflected below.` +
              `</p>` +
          `${htmlList}` +
          `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;"><span class="strong" style="color: #131C4F;">IMPORTANT:</span> While we've gone ahead and funded your investment, you will not be able to withdraw funds from this purchase until your bank fund transfer is confirmed, usually within 1-2 business days.</p>`
    }
  },
  pushData: {
    conditional: true,
    title: "You've Got Crypto",
    body: "Congrats! Your transaction is completed. Let's check it out."
  }
}

NOTIFICATIONS[EVENTS.CONFIRM_SALE_OF_CRYPTO] = {
  emailData: {
    subject: "You've made a sale",
    title: "You've made a sale",
    body: ({ coins, value }) => {
      const htmlList = _generateHtmlAssetsList(coins, value)
      return `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
                `Boo-yah! You've just sold cryptocurrency holdings in Onramp. The funds for your sale are now reflected in your Onramp cash account. Your latest transaction and updated portfolio are reflected below.` +
              `</p>` +
          `${htmlList}`
    }
  },
  pushData: {
    conditional: true,
    title: "You've Sold Crypto",
    body: "Congrats! Your transaction is completed. Let's check it out."
  }
}

NOTIFICATIONS[EVENTS.WITHDRAWAL_OF_FUNDS] = {
  emailData: {
    subject: 'Money coming your way',
    title: 'Money coming your way',
    body: `<div>Cha-ching! You've successfully requested a withdraw from your Onramp Investment app to your bank account. Funds should appear in your bank account within 1-2 business days.</div>`
  }
}

NOTIFICATIONS[EVENTS.INSUFFICIENT_FUND_FOR_SPARECHANGE] = {
  emailData: {
    subject: 'SpareChange(TM) round-up did not complete.',
    title: 'SpareChange<sup>TM</sup> round-up did not complete.',
    body: `<div> Oh-oh! Your SpareChange round-up did not go through this month because of insufficient funds in your bank account. Please add funds to your bank account and Onramp will try again in 2 days. Remember, Onramp will never overdraft your account.</div><div>You can change or cancel SpareChange investments anytime in the "Boosts" section of your Onramp app.</div>`
  },
  pushData: {
    title: 'Insufficient fund',
    body: 'Your Sparehange boost did not go through because of insufficient funds. Please fund your bank account and Onramp will try again in 2 days.'
  }
}

NOTIFICATIONS[EVENTS.INSUFFICIENT_FUND_FOR_RECURRING] = {
  emailData: {
    subject: 'Recurring investment did not complete.',
    title: 'Recurring investment did not complete.',
    body: `<div> Oh-oh! Your recurring investment did not go through this month because of insufficient funds in your bank account. Please add funds to your bank account and Onramp will try again in 2 days. Remember, Onramp will never overdraft your account.</div><div>You can change or cancel recurring investments anytime in the "Boosts" section of your Onramp app.</div>`
  },
  pushData: {
    title: 'Insufficient fund',
    body: 'Your Recurring boost did not go through because of insufficient funds. Please fund your bank account and Onramp will try again in 2 days.'
  }
}

NOTIFICATIONS[EVENTS.CANCEL_SPARECHANGE] = {
  emailData: {
    subject: 'SpareChange(TM) has been cancelled',
    title: 'SpareChange<sup>TM</sup> has been cancelled',
    body: `You've successfully canceled SpareChange credit card round-ups in your Onramp account. You can restart it in the "Boosts" section of your Onramp app anytime.`
  }
}

NOTIFICATIONS[EVENTS.CANCEL_RECURRING] = {
  emailData: {
    subject: 'Recurring Investments has been cancelled',
    title: 'Recurring Investments has been cancelled',
    body: `<div>You've successfully canceled monthly recurring investments in your Onramp account. You can restart it in the "Boosts" section of your Onramp app anytime.</div>`
  }
}

NOTIFICATIONS[EVENTS.FORGOT_PASSWORD] = {
  emailData: {
    subject: 'Password reset',
    title: '',
    body: (link) => `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
                 `We received a request to reset your password. Click the <br> button below to set a new one:</p>` +
              `<a class="link btn-link" href="${link}" style="box-sizing: border-box; text-decoration: none; font-size: 16px; color: #131C4F; display: inline-block; width: 195px; height: 50px; line-height: 50px; border-radius: 4px; background: #00EEAD;">Confirm Email</a>`
  }
}

NOTIFICATIONS[EVENTS.GENERATED_NEW_PASSWORD] = {
  emailData: {
    subject: 'Password reset',
    title: '',
    body: (pass) => `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your generated password is <br> ${pass} <br> you can login and change the password</p>`
  }
}

NOTIFICATIONS[EVENTS.INVESTMENT_FAILED] = {
  pushData: {
    title: 'Your investment failed',
    body: 'Your investment did not go through crypto trading issuses'
  }
}

NOTIFICATIONS[EVENTS.NOTIFY_FOR_RECURRING] = {
  emailData: {
    subject: 'Hello #FIRST_NAME #LAST_NAME',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: ({ amount, date }) => `<div>As requested, we will apply a recurring monthly boost in the amount of $${util.format(amount, 2)} to your Onramp account. This amount will be transferred from your bank to Onramp in 2 days (${date}).</div><div>To change your monthly automatic investments, go to the Boost tab within the app</div>`
  }
}

NOTIFICATIONS[EVENTS.NOTIFY_FOR_SPARECHANGE] = {
  emailData: {
    subject: 'Hello #FIRST_NAME #LAST_NAME',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: ({ amount, date, masks }) => `<div>Onramp has rounded up purchases from your credit card(s) ending in ${masks}, and is ready make your SpareChange monthly boost of $${util.format(amount, 2)}. This amount will be transferred from your bank to Onramp in 2 days (${date}).</div><div>To change your monthly automatic investments, go to the Boost tab within the app</div>`
  }
}

NOTIFICATIONS[EVENTS.NOT_IN_WHITELIST] = {
  emailData: {
    subject: 'Thank you for your interest in Onramp',
    title: 'Thank you for your interest in Onramp',
    body: `<div>We will notify you when your account is activated. If you have any questions or comments, please contact the Onramp team: help@tryonramp.com</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_CREATED] = {
  emailData: {
    subject: 'Onramp - Transfer Created',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A transfer was initiated to your Onramp account. Here are the details of this payment: ` +
      `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: ${data.source} ` +
    `<br> RECIPIENT: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_CANCELLED] = {
  emailData: {
    subject: 'Onramp - Transfer Cancelled',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your payment to Onramp has been cancelled. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: ${data.source} ` +
    `<br> RECIPIENT: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_FAILED] = {
  emailData: {
    subject: 'Onramp - Transfer Failed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A payment initiated to Onramp has failed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: ${data.source} ` +
    `<br> RECIPIENT: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_COMPLETED] = {
  emailData: {
    subject: 'Onramp - Transfer Completed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your payment to Onramp has completed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: ${data.source} ` +
    `<br> RECIPIENT: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_CREATED] = {
  emailData: {
    subject: 'Onramp - Transfer Created',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A transfer was initiated from your Onramp account. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: ${data.source} ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_CANCELLED] = {
  emailData: {
    subject: 'Onramp - Transfer Cancelled',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your payment from Onramp has been cancelled. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: ${data.source} ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_FAILED] = {
  emailData: {
    subject: 'Onramp - Transfer Failed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A payment initiated from Onramp has failed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: ${data.source} ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_COMPLETED] = {
  emailData: {
    subject: 'Onramp - Transfer Completed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your payment from Onramp has completed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: ${data.source} ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_CREATED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Created',
    title: 'Investment Created',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A transfer was initiated from customer to Onramp account. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: #FIRST_NAME #LAST_NAME ` +
    `<br> DESTINATION: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_CANCELLED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Cancelled',
    title: 'Investment Cancelled',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Customer payment to Onramp account has been cancelled. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: #FIRST_NAME #LAST_NAME ` +
    `<br> DESTINATION: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_FAILED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Failed',
    title: 'Investment Failed',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A payment initiated by customer to Onramp account has failed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: #FIRST_NAME #LAST_NAME ` +
    `<br> DESTINATION: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_INVESTMENT_COMPLETED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Completed',
    title: 'Investment Completed',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Customer payment to Onramp account has completed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SOURCE: #FIRST_NAME #LAST_NAME ` +
    `<br> DESTINATION: Onramp Invest, LLC ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_CREATED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Created',
    title: 'Withdraw Request',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A transfer was initiated from Onramp account to customer. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: #FIRST_NAME #LAST_NAME ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_CANCELLED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Cancelled',
    title: 'Withdraw Cancelled',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your payment from Onramp account to customer has been cancelled. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: #FIRST_NAME #LAST_NAME ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_FAILED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Failed',
    title: 'Withdraw Failed',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A payment initiated from Onramp account to customer has failed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: #FIRST_NAME #LAST_NAME ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_WITHDRAW_COMPLETED_RS] = {
  emailData: {
    subject: 'Onramp - Transfer Completed',
    title: 'Withdraw Completed',
    body: (data) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your payment from Onramp account to customer has completed. Here are the details of this payment: ` +
    `<br>  ` +
    `<br> TRANSFER TYPE: ${data.transferType} ` +
    `<br> SENDER: Onramp Invest, LLC ` +
    `<br> DESTINATION: #FIRST_NAME #LAST_NAME ` +
    `<br> AMOUNT: $${data.amount} ` +
    `<br> DATE INITIATED: ${data.date} ` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this transfer please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_FUNDING_SOURCE_ADDED] = {
  emailData: {
    subject: 'Onramp - Funding Source Added',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: ({ bankAccount, source, date }) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A funding bank account was added to your Onramp account. Here are the details: ` +
    `<br>  ` +
    `<br> BANK NAME: ${bankAccount} ` +
    `<br> ACCOUNT: ${source} ` +
    `<br> DATE ADDED: ${date} ` +
    `<br>  ` +
    `<br> You’ve agreed that future payments to Onramp will be processed by the Dwolla payment system using bank account ${bankAccount}. To change or cancel go to the Settings section of your Onramp app.` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this bank account being added please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_FUNDING_SOURCE_REMOVED] = {
  emailData: {
    subject: 'Onramp - Funding Source Removed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: ({ bankAccount, source, date }) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `A bank account ${bankAccount} ${source} was removed from your Onramp account on ${date}. . As a result any SpareChange or Recurring investments will not be debited from this account. Please set up a new primary funding source in your App settings.` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this bank account being removed please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_FUNDING_SOURCE_VERIFIED] = {
  emailData: {
    subject: 'Onramp - Funding Source Verified',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: ({ bankAccount, source, date }) => `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Good news! The bank account you recently added to your Onramp account, ${bankAccount} ${source}, was verified on ${date}.` +
    `<br>  ` +
    `<br> If you have any questions or concerns about this bank account being verified please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_CREATED] = {
  emailData: {
    subject: 'Onramp - Customer Created',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Congrats! Your Onramp account was successfully created. As part of your Onramp account, we have also created a Dwolla account for you to facilitate quick money transfers to and from your Onramp account.` +
    `<br>  ` +
    `<br> By creating an Onramp account you have also agreed to the Dwolla <a href="https://www.dwolla.com/legal/tos/" class="normal-link" style="box-sizing: border-box; color: #2F61D5; text-decoration: none;">Terms of Service</a> and  <a href="https://www.dwolla.com/legal/privacy/" class="normal-link" style="box-sizing: border-box; color: #2F61D5; text-decoration: none;">Privacy Policy</a>, and opened a Dwolla account.` +
    `<br>  ` +
    `<br> If you have any questions or concerns please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_SUSPENDED] = {
  emailData: {
    subject: 'Onramp - Customer Suspended',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your Onramp account has been suspended. ` +
    `<br>  ` +
    `<br> If you have any questions or concerns regarding your account suspension, please contact support at support@onrampinvest.com.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_VERIFIED] = {
  emailData: {
    subject: 'Onramp - Customer verified',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your Onramp account has been successfully verified. ` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_UPLOADED] = {
  emailData: {
    subject: 'Onramp - Customer verification document uploaded',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your Onramp account verification documents have been successfully uploaded.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_APPROVED] = {
  emailData: {
    subject: 'Onramp - Customer verification document approved',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your Onramp verification documents have successfully passed the verification process.` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_FAILED] = {
  emailData: {
    subject: 'Onramp - Customer verification document failed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Your Onramp account verification failed. Please contact Onramp Support to provide the necessary identifying documents. ` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_NEEDED] = {
  emailData: {
    subject: 'Onramp - Customer verification document needed',
    title: 'Hello #FIRST_NAME #LAST_NAME',
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; text-align: left; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Additional documents are needed to complete your Onramp account verification: ` +
    `</br>` +
    `</br>` +
    `<ul>` +
    `<li> a non-expired state issued driver’s license or ID card </li>` +
    `<li> a non-expired U.S. passport </li>` +
    `</ul>` +
    `</br>` +
    `</br>` +
    `Please contact Onramp Support to provide the necessary identifying documents. ` +
    `</div>`
  }
}

NOTIFICATIONS[EVENTS.INVITATION] = {
  emailData: {
    subject: '#FIRST_NAME #LAST_NAME invited you to try Onramp',
    title: '#FIRST_NAME #LAST_NAME invited you to try Onramp',
    body: payload => `<p class="text" style="font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #5E6278;">` +
    `Join the Onramp early access waitlist to get six months FREE, a first investment match, and $10 towards your first investment.</p>` +
    `<a class="link btn-link" href="${payload.link}" style="box-sizing: border-box; text-decoration: none; font-size: 16px; color: #131C4F; display: inline-block; width: 195px; height: 50px; line-height: 50px; border-radius: 4px; background: #00EEAD;">Get Early Access</a>`

  }
}

module.exports = {
  NOTIFICATIONS, EVENTS
}
