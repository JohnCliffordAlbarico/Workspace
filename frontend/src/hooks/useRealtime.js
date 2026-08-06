import { useEffect, useRef } from 'react'
import { supabase } from '../config/supabaseClient'

/**
 * Subscribe to real-time changes on the tasks table.
 * When a task is inserted, updated, or deleted, the callback fires.
 *
 * @param {Function} callback - Called with (eventType, newTask, oldTask)
 * @param {Object} options - { workspaceId } to filter events
 */
export function useRealtime(callback, options = {}) {
  const callbackRef = useRef(callback)

  // Keep ref up to date without triggering re-subscription
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks',
          filter: options.workspaceId
            ? `workspace_id=eq.${options.workspaceId}`
            : undefined
        },
        (payload) => {
          callbackRef.current(payload.eventType, payload.new, payload.old)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options.workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps
}
