import { useState, useEffect } from 'react'

export function useRelativeTime(dateString: string) {
  const [relativeTime, setRelativeTime] = useState('')

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d`
    } else {
      return date.toLocaleDateString()
    }
  }

  useEffect(() => {
    const date = new Date(dateString)
    setRelativeTime(formatRelativeTime(date))

    // Update every minute for the first hour, then every hour for the first day
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    let interval: NodeJS.Timeout
    
    if (diffInSeconds < 3600) {
      // Update every minute for the first hour
      interval = setInterval(() => {
        setRelativeTime(formatRelativeTime(new Date(dateString)))
      }, 60000) // 60 seconds
    } else if (diffInSeconds < 86400) {
      // Update every hour for the first day
      interval = setInterval(() => {
        setRelativeTime(formatRelativeTime(new Date(dateString)))
      }, 3600000) // 60 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [dateString])

  return relativeTime
}
