export const wait = async (seconds: number) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, seconds * 1000)
  })
}
