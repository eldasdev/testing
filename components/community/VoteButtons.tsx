'use client'

import { useState, useEffect } from 'react'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'
import { useSession } from 'next-auth/react'

interface VoteButtonsProps {
  threadId: string
  initialUpvotes: number
  initialDownvotes: number
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
}

export default function VoteButtons({
  threadId,
  initialUpvotes,
  initialDownvotes,
  size = 'md',
  orientation = 'horizontal',
}: VoteButtonsProps) {
  const { data: session, status } = useSession()
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userReaction, setUserReaction] = useState<'UPVOTE' | 'DOWNVOTE' | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(status === 'loading')

  useEffect(() => {
    // Wait for session to finish loading
    if (status === 'loading') {
      setFetching(true)
      return
    }

    // Only fetch if user is authenticated
    if (status === 'authenticated' && session?.user) {
      fetchUserReaction()
    } else {
      // User is not authenticated, skip fetching
      setFetching(false)
      setUserReaction(null)
    }
  }, [status, session?.user, threadId])

  const fetchUserReaction = async () => {
    if (!session?.user) {
      setFetching(false)
      return
    }

    try {
      const response = await fetch(`/api/community/threads/${threadId}/reaction`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserReaction(data.reaction?.type || null)
      } else if (response.status === 401) {
        // User is not authenticated, which is fine
        setUserReaction(null)
      }
    } catch (error) {
      // Silently handle errors - user might not be logged in or network issue
      console.debug('Could not fetch user reaction:', error)
      setUserReaction(null)
    } finally {
      setFetching(false)
    }
  }

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!session?.user) {
      // Could show a login prompt here
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/community/threads/${threadId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvotes)
        setDownvotes(data.downvotes)
        setUserReaction(data.reaction?.type || null)
      } else if (response.status === 401) {
        // User session expired, refresh
        window.location.reload()
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Don't show error to user, just log it
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: {
      button: 'p-1.5',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs',
    },
    md: {
      button: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      button: 'p-2.5',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  }

  const sizeConfig = sizeClasses[size]
  const isVertical = orientation === 'vertical'

  return (
    <div
      className={`flex items-center gap-2 ${
        isVertical ? 'flex-col' : 'flex-row'
      }`}
    >
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('UPVOTE')}
        disabled={loading || fetching || !session}
        className={`${sizeConfig.button} rounded-lg transition-all ${
          userReaction === 'UPVOTE'
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Upvote"
      >
        <div className="flex items-center gap-1.5">
          <FiThumbsUp className={sizeConfig.icon} />
          <span className={`${sizeConfig.text} font-semibold`}>{upvotes}</span>
        </div>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('DOWNVOTE')}
        disabled={loading || fetching || !session}
        className={`${sizeConfig.button} rounded-lg transition-all ${
          userReaction === 'DOWNVOTE'
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Downvote"
      >
        <div className="flex items-center gap-1.5">
          <FiThumbsDown className={sizeConfig.icon} />
          <span className={`${sizeConfig.text} font-semibold`}>{downvotes}</span>
        </div>
      </button>
    </div>
  )
}
