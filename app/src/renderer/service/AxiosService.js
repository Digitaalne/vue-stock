import Axios from 'axios'
import Vue from 'vue'
require('dotenv').config()

const API_URL = process.env.API_URL

const axios = Axios.create({
  baseURL: API_URL
})

async function request (config) {
  const requestConfig = { ...config }

  const authToken = localStorage.getItem('AUTH_TOKEN')
  if (authToken) {
    if (!requestConfig.headers) {
      requestConfig.headers = {}
    }
    requestConfig.headers.authorization = authToken
    requestConfig.headers.service = localStorage.getItem('SERVICE')
  }

  try {
    const response = await axios.request(requestConfig)
    return response.data
  } catch (error) {
    Vue.notify({
      group: 'app',
      text: 'Action failed!',
      type: 'error'
    })
    console.error(error)
  }
}

export default {
  get (url, config) {
    return request({
      ...config,
      method: 'GET',
      url
    })
  },

  post (url, data, config) {
    return request({
      ...config,
      method: 'POST',
      url,
      data
    })
  }
}
