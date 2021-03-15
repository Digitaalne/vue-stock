import axiosService from './AxiosService.js'
import store from '../store/index'

require('dotenv').config()

let win = null
const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow

const SCOPE = 'scope=trading%20data'
const REDIRECT_URL = 'http://localhost:9080/callback'
const REDIRECT_URL_FULL = 'redirect_uri=' + REDIRECT_URL
const RESPONSE_TYPE = 'response_type=code'
const AUTH_BASE_URL = 'https://app.alpaca.markets/oauth/authorize?'
const CLIENT_ID = 'client_id=' + process.env.ALPACA_CLIENT_ID

const LOGIN_URL = 'auth'

function init () {
  if (win) {
    return win.show()
  }
  win = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: false
    }
  })
  win.on('close', function () { win = null })

  win.loadURL(AUTH_BASE_URL + SCOPE + '&' + RESPONSE_TYPE + '&' + REDIRECT_URL_FULL + '&' + CLIENT_ID)
  const {
    session: { webRequest }
  } = win.webContents

  const filter = {
    urls: ['http://localhost:9080/callback*']
  }
  webRequest.onBeforeRequest(filter, async ({ url }) => {
    await getToken(url)
    return destroyAuthWin()
  })
}

function destroyAuthWin () {
  if (!win) return
  win.close()
  win = null
}

async function getToken (cburl) {
  const code = require('url').parse(cburl, true).query.code
  const body = {code: code,
    client_id: process.env.ALPACA_CLIENT_ID,
    redirect_uri: REDIRECT_URL}
  var request = await axiosService.post(LOGIN_URL, body)
  localStorage.setItem('AUTH_TOKEN', request.token_type + ' ' + request.access_token)
  localStorage.setItem('SERVICE', 'ALPACA')
  store.dispatch('login' + '/login')
  return true
}

export default {
  init,
  win
}
