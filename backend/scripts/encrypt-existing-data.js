import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { encrypt, isEncrypted } from '../src/utils/crypto.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BATCH_SIZE = 100

async function encryptTasks() {
  console.log('Encrypting tasks...')
  let offset = 0
  let total = 0

  while (true) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, description')
      .range(offset, offset + BATCH_SIZE - 1)

    if (error) throw error
    if (!tasks.length) break

    const updates = []
    for (const task of tasks) {
      const newTitle = isEncrypted(task.title) ? task.title : encrypt(task.title)
      const newDesc = task.description
        ? (isEncrypted(task.description) ? task.description : encrypt(task.description))
        : null

      if (newTitle !== task.title || newDesc !== task.description) {
        updates.push({ id: task.id, title: newTitle, description: newDesc })
      }
    }

    if (updates.length) {
      for (const u of updates) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ title: u.title, description: u.description })
          .eq('id', u.id)
        if (updateError) console.error(`Failed to encrypt task ${u.id}:`, updateError.message)
      }
      total += updates.length
    }

    offset += BATCH_SIZE
    if (tasks.length < BATCH_SIZE) break
  }

  console.log(`Encrypted ${total} tasks`)
}

async function encryptCategories() {
  console.log('Encrypting focus categories...')
  let offset = 0
  let total = 0

  while (true) {
    const { data: categories, error } = await supabase
      .from('focus_categories')
      .select('id, name')
      .range(offset, offset + BATCH_SIZE - 1)

    if (error) throw error
    if (!categories.length) break

    const updates = []
    for (const cat of categories) {
      const newName = isEncrypted(cat.name) ? cat.name : encrypt(cat.name)
      if (newName !== cat.name) {
        updates.push({ id: cat.id, name: newName })
      }
    }

    if (updates.length) {
      for (const u of updates) {
        const { error: updateError } = await supabase
          .from('focus_categories')
          .update({ name: u.name })
          .eq('id', u.id)
        if (updateError) console.error(`Failed to encrypt category ${u.id}:`, updateError.message)
      }
      total += updates.length
    }

    offset += BATCH_SIZE
    if (categories.length < BATCH_SIZE) break
  }

  console.log(`Encrypted ${total} focus categories`)
}

async function main() {
  try {
    await encryptTasks()
    await encryptCategories()
    console.log('Done!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
