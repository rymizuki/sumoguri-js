import { wait } from './wait'

describe('wait', () => {
  describe('specified seconds', () => {
    it('should be called after specified seconds', async () => {
      const prev = Math.floor(new Date().getTime() / 1000)
      await wait(3)
      const next = Math.floor(new Date().getTime() / 1000)
      expect(next - prev).toBe(3)
    })
  })
})
