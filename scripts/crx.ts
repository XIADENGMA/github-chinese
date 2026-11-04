/**
 * CRX3 扩展包（Chrome、Edge 可安装），格式同 Chromium 的 components/crx_file（crx3.proto、crx_creator.cc）：
 *   「Cr24」+ 格式版本 3（uint32 LE）+ 文件头长度（uint32 LE）+ 文件头 CrxFileHeader + zip
 * 文件头：sha256_with_rsa（字段 2：公钥 SPKI DER、签名）、signed_header_data（字段 10000：SignedData，内含 crx_id）。
 * 签名：RSA PKCS#1 v1.5 + SHA-256，签名内容为「CRX3 SignedData\0」+ signed_header_data 长度（uint32 LE）
 *   + signed_header_data + zip。
 * crx_id 是公钥 SHA-256 的前 16 字节；扩展 ID 是它的十六进制写法，0-f 换成 a-p
 */
import { createHash, createPublicKey, createSign, type KeyObject } from 'node:crypto'

const MAGIC = Buffer.from('Cr24', 'latin1')
const FORMAT_VERSION = 3
/** 签名内容的开头，含结尾的 \0 */
const SIGNATURE_CONTEXT = Buffer.from('CRX3 SignedData\0', 'latin1')
const CRX_ID_LENGTH = 16
/** zip 本地文件头的签名 PK\x03\x04 */
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04])

/** crx3.proto 的字段号 */
const HEADER_SHA256_WITH_RSA = 2
const HEADER_SIGNED_HEADER_DATA = 10000
const PROOF_PUBLIC_KEY = 1
const PROOF_SIGNATURE = 2
const SIGNED_DATA_CRX_ID = 1

function varint(value: number): Buffer {
  const bytes: number[] = []
  let rest = value
  while (rest >= 0x80) {
    bytes.push((rest & 0x7f) | 0x80)
    rest >>>= 7
  }
  bytes.push(rest)
  return Buffer.from(bytes)
}

/** protobuf 的长度限定字段（wire type 2）：标签、长度、内容 */
function lengthDelimited(field: number, value: Uint8Array): Buffer {
  return Buffer.concat([varint((field << 3) | 2), varint(value.length), value])
}

function uint32LE(value: number): Buffer {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(value)
  return buffer
}

/** 公钥（SPKI DER）的 crx_id：SHA-256 的前 16 字节 */
export function crxIdOf(publicKey: Uint8Array): Buffer {
  return createHash('sha256').update(publicKey).digest().subarray(0, CRX_ID_LENGTH)
}

/** crx_id 对应的扩展 ID：十六进制的 0-f 换成 a-p */
export function extensionIdOf(crxId: Uint8Array): string {
  return Array.from(Buffer.from(crxId).toString('hex'), digit => String.fromCharCode(0x61 + Number.parseInt(digit, 16))).join('')
}

export interface Crx {
  /** CRX3 文件内容 */
  readonly bytes: Buffer
  /** 扩展 ID：同一私钥打出的包相同 */
  readonly id: string
}

/** 用 RSA 私钥给 zip 签名，生成 CRX3 */
export function packCrx(zip: Uint8Array, privateKey: KeyObject): Crx {
  if (privateKey.type !== 'private' || privateKey.asymmetricKeyType !== 'rsa') throw new Error('私钥须为 RSA 私钥')
  if (!Buffer.from(zip.subarray(0, ZIP_SIGNATURE.length)).equals(ZIP_SIGNATURE)) throw new Error('不是 zip 文件')
  const publicKey = createPublicKey(privateKey).export({ type: 'spki', format: 'der' })
  const crxId = crxIdOf(publicKey)
  const signedData = lengthDelimited(SIGNED_DATA_CRX_ID, crxId)
  const signature = createSign('sha256')
    .update(SIGNATURE_CONTEXT)
    .update(uint32LE(signedData.length))
    .update(signedData)
    .update(zip)
    .sign(privateKey)
  const proof = Buffer.concat([lengthDelimited(PROOF_PUBLIC_KEY, publicKey), lengthDelimited(PROOF_SIGNATURE, signature)])
  const header = Buffer.concat([lengthDelimited(HEADER_SHA256_WITH_RSA, proof), lengthDelimited(HEADER_SIGNED_HEADER_DATA, signedData)])
  return {
    bytes: Buffer.concat([MAGIC, uint32LE(FORMAT_VERSION), uint32LE(header.length), header, zip]),
    id: extensionIdOf(crxId)
  }
}
