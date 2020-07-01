import { encode } from 'https://deno.land/std/encoding/base64.ts'
import { HmacSha256 } from 'https://deno.land/std/hash/sha256.ts'

/** shortcut for HmacSha256 */
export function sign(secret: string, value: string) {
  const sha256 = new HmacSha256(secret)
  const buffer = sha256.update(value).arrayBuffer()
  return encode(buffer)
}
