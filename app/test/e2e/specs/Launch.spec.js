import utils from '../utils'

describe('Launch', function () {
  before(utils.before)
  after(utils.after)

  it('shows the proper application title', async function () {
    return assert.equal(await this.app.client.getTitle(), 'UltimateTrader')
  })
})
