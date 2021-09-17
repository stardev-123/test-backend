/* global it, describe */

module.exports = (allDone) => {
  describe('DB Data check after tests', () => {
    it('DB check - test finished event', async () => {
      allDone()
    })
  })
}
