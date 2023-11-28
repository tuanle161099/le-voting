import * as secp256k1 from '@noble/secp256k1'

/**
 * Xor multiple buffers.
 * @param arr The buffer list.
 * @returns Uint8Array
 */
export const xor = (...arr: Uint8Array[]): Uint8Array => {
  if (!arr || !arr.length) throw new Error('Cannot XOR empty input.')
  const [init, ...rest] = arr
  return rest.reduce((result, next) => {
    if (result.length !== init.length)
      throw new Error('Cannot XOR different length inputs.')
    return result.map((el, i) => el ^ next[i])
  }, init)
}

export const BGSG = async (points: secp256k1.Point[]) => {
  const P = secp256k1.Point.BASE
  const result: number[] = []
  for (const G of points) {
    for (let j = 1; j <= 100; j++) {
      if (secp256k1.Point.ZERO.equals(G)) {
        result.push(0)
        break
      }
      if (P.multiply(j).equals(G)) {
        result.push(j)
        break
      }
    }
  }
  return result
}
