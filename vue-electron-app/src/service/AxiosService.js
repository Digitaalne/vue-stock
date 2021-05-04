import Axios from "axios";
import Vue from "vue";

const axios = Axios.create();

async function request(config) {
  const requestConfig = { ...config };
  if (!requestConfig.headers) {
    requestConfig.headers = {};
  }
  try {
    console.log(requestConfig.url);
    const response = await axios.request(requestConfig);
    return response.data;
  } catch (error) {
    Vue.notify({
      group: "app",
      text: "Action failed!",
      type: "error"
    });
    console.error(error);
  }
}

export default {
  get(url, config) {
    return request({
      ...config,
      method: "GET",
      url
    });
  },

  post(url, data, config) {
    return request({
      ...config,
      method: "POST",
      url,
      data
    });
  }
};
