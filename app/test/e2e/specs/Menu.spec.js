import utils from '../utils'

describe('Navigation', function () {
  before(utils.beforeWithLogin)
  after(utils.after)

  it('Navigation to Live works', async function () {
    await this.app.client.click('.md-tab-label=LIVE')
    let isVisible = await this.app.client.isExisting('#live')
    assert.isTrue(isVisible)
  })
  it('Navigation to Historic works', async function () {
    await this.app.client.click('.md-tab-label=HISTORIC DATA')
    let isVisible = await this.app.client.isExisting('#historic')
    assert.isTrue(isVisible)
  })

  it('Navigation to Trade History works', async function () {
    await this.app.client.click('.md-tab-label=POSITION')
    let isVisible = await this.app.client.isExisting('#position')
    assert.isTrue(isVisible)
  })

  it('Navigation to Position works', async function () {
    await this.app.client.click('.md-tab-label=TRADE HISTORY')
    let isVisible = await this.app.client.isExisting('#history')
    assert.isTrue(isVisible)
  })
})
