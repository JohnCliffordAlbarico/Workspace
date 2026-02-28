import { supabaseAdmin } from '../config/supabase.js'

export const auditLog = (tableName) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res)
    const originalSend = res.send.bind(res)

    // Capture the response data
    res.json = function (data) {
      res.locals.responseData = data
      return originalJson(data)
    }

    res.send = function (data) {
      res.locals.responseData = data
      return originalSend(data)
    }

    // Store original data for updates/deletes
    if (req.method === 'PUT' || req.method === 'DELETE') {
      try {
        const recordId = req.params.id
        if (recordId) {
          const { data } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .eq('id', recordId)
            .single()
          
          res.locals.oldData = data
        }
      } catch (error) {
        // Continue even if we can't fetch old data
      }
    }

    // Log after response is sent
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          let action = null
          let recordId = null
          let oldData = null
          let newData = null

          switch (req.method) {
            case 'POST':
              action = 'CREATE'
              newData = res.locals.responseData
              recordId = newData?.id
              break
            case 'PUT':
            case 'PATCH':
              action = 'UPDATE'
              oldData = res.locals.oldData
              newData = res.locals.responseData
              recordId = req.params.id
              break
            case 'DELETE':
              action = 'DELETE'
              oldData = res.locals.oldData
              recordId = req.params.id
              break
          }

          if (action) {
            await supabaseAdmin
              .from('audit_logs')
              .insert({
                user_id: req.user?.id || null,
                action,
                table_name: tableName,
                record_id: recordId,
                old_data: oldData,
                new_data: newData
              })
          }
        } catch (error) {
          console.error('Audit log error:', error.message)
        }
      }
    })

    next()
  }
}
