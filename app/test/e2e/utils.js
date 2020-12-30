import electron from 'electron'
import { Application } from 'spectron'
require('dotenv').config()

export default {
  afterEach () {
    this.timeout(10000)

    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  },
  async beforeEach (done) {
    this.timeout(15000)
    this.app = new Application({
      path: electron,
      args: ['dist/electron/main.js'],
      startTimeout: 15000,
      waitTimeout: 15000
    })
    await this.app.start()
    done()
  },
  after () {
    this.timeout(60000)

    if (this.app && this.app.isRunning()) {
      return this.app.stop()
      
    }
  },
  before () {
    this.timeout(30000)
    this.app = new Application({
      path: electron,
      args: ['dist/electron/main.js'],
      startTimeout:20000,
      waitTimeout: 100000
    })
    return this.app.start()
  },
  async beforeWithLogin() {
      this.timeout(60000)
      this.app = new Application({
        path: electron,
        args: ['dist/electron/main.js'],
        startTimeout:20000,
        waitTimeout: 100000
      })
      await this.app.start()
      if(await this.app.client.isVisible('.md-tab-label=LOG IN')){
        await this.app.client.click('.md-tab-label=LOG IN')
        await new Promise(r => setTimeout(r, 5000));
        await this.app.client.windowByIndex(1)
        if(await this.app.client.isVisible('=Log In'))
          await this.app.client.click('=Log In')
        await new Promise(r => setTimeout(r, 1000));
        if(await this.app.client.isVisible('[name="username"]'))
          await this.app.client.setValue('[name="username"]', process.env.EMAIL)
        if(await this.app.client.isVisible('[name="password"]'))
          await this.app.client.setValue('[name="password"]', process.env.PASSWORD)
        if(await this.app.client.isVisible('.ant-btn=Login'))
          await this.app.client.click('.ant-btn=Login')
        await new Promise(r => setTimeout(r, 5000));
        await this.app.client.click('.ant-btn=Allow')
        await new Promise(r => setTimeout(r, 3000));
        await this.app.client.windowByIndex(0)
      }
      return assert.isTrue(true)
    }
}
