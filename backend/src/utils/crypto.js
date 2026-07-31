import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

const getEncryptionKey = () => {
  const key = process.env.DIARY_ENCRYPTION_KEY
  if (!key) {
    throw new Error('DIARY_ENCRYPTION_KEY environment variable is not set')
  }
  return Buffer.from(key, 'hex')
}

export const encrypt = (text) => {
  if (!text) return null
  
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Combine IV + Tag + Encrypted data
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
}

export const decrypt = (encryptedText) => {
  if (!encryptedText) return null
  
  const key = getEncryptionKey()
  const parts = encryptedText.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format')
  }
  
  const iv = Buffer.from(parts[0], 'hex')
  const tag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}