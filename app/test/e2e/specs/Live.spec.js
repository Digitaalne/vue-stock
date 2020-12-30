import utils from '../utils'

describe('Live page', function () {
  before(utils.beforeWithLogin)
  after(utils.after)

  it('Live stock search works', async function () {
    this.timeout(10000)
    await this.app.client.click('.md-tab-label=LIVE')
    await this.app.client.setValue('[name="search"]', 'AAPL')
    await this.app.client.click('.md-button-content=Search')
    await new Promise(resolve => setTimeout(resolve, 5500))
    return assert.isTrue(await this.app.client.isExisting('#chart'))
  })
})
