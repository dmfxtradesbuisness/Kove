'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Users2, Heart, Plus, Loader2, Send, X, Wifi, WifiOff } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────
type PostType = 'general' | 'setup' | 'win' | 'loss' | 'news_reaction'

interface Post {
  id: string
  user_id: string
  content: string
  post_type: PostType
  tickers: string[]
  like_count: number
  created_at: string
  liked_by_me?: boolean
}

// ─── Config ──────────────────────────────────────────────────────────────────
const TYPE_CFG: Record<PostType, { label: string; text: string; bg: string; border: string }> = {
  general:       { label: 'General',   text: '#888888',   bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.10)' },
  setup:         { label: 'Setup',     text: '#a78bfa',   bg: 'rgba(139,92,246,0.12)',    border: 'rgba(139,92,246,0.25)' },
  win:           { label: 'Win',       text: '#34d399',   bg: 'rgba(52,211,153,0.12)',    border: 'rgba(52,211,153,0.25)' },
  loss:          { label: 'Loss',      text: '#f87171',   bg: 'rgba(248,113,113,0.12)',   border: 'rgba(248,113,113,0.25)' },
  news_reaction: { label: 'News',      text: '#fbbf24',   bg: 'rgba(251,191,36,0.12)',    border: 'rgba(251,191,36,0.25)' },
}

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: 'all',           label: 'All' },
  { key: 'setup',         label: 'Setup' },
  { key: 'win',           label: 'Win' },
  { key: 'loss',          label: 'Loss' },
  { key: 'news_reaction', label: 'News' },
]

// ─── Utils ────────────────────────────────────────────────────────────────────
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return Math.abs(h) % 9000 + 1000
}

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const supabase = createClient()

  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [composing, setComposing]   = useState(false)
  const [content, setContent]       = useState('')
  const [postType, setPostType]     = useState<PostType>('general')
  const [submitting, setSubmitting] = useState(false)
  const [myId, setMyId]             = useState<string | null>(null)
  const [live, setLive]             = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch posts
  const fetchPosts = useCallback(async (activeFilter: string) => {
    setLoading(true)
    try {
      const params = activeFilter !== 'all' ? `?post_type=${activeFilter}` : ''
      const res = await fetch(`/api/community/posts${params}`)
      const json = await res.json()
      setPosts(json.posts ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts(filter) }, [filter, fetchPosts])

  // Realtime subscription
  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const ch = supabase
      .channel('community_feed_v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload) => {
          const newPost = payload.new as Post
          if (filter !== 'all' && newPost.post_type !== filter) return
          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) return prev
            return [{ ...newPost, liked_by_me: false }, ...prev]
          })
        }
      )
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED')
      })

    channelRef.current = ch
    return () => {
      supabase.removeChannel(ch)
    }
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit post
  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), post_type: postType }),
      })
      const json = await res.json()
      if (json.post) {
        setPosts((prev) => {
          if (prev.some((p) => p.id === json.post.id)) return prev
          if (filter !== 'all' && json.post.post_type !== filter) return prev
          return [json.post, ...prev]
        })
      }
      setContent('')
      setPostType('general')
      setComposing(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle like
  const handleLike = async (postId: string, liked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: !liked, like_count: liked ? p.like_count - 1 : p.like_count + 1 }
          : p
      )
    )
    await fetch(`/api/community/posts/${postId}/like`, {
      method: liked ? 'DELETE' : 'POST',
    })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in"
      style={{ maxWidth: 720 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p
            className="text-xs uppercase tracking-widest mb-1.5 font-medium"
            style={{ color: '#444', fontFamily: 'var(--font-display)' }}
          >
            Traders
          </p>
          <h1
            className="text-3xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Community
          </h1>
          <p className="text-xs font-light mt-1" style={{ color: '#555', fontFamily: 'var(--font-body)' }}>
            Share setups, lessons &amp; wins anonymously
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: live ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${live ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}` }}
          >
            {live ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                <Wifi className="w-3 h-3" style={{ color: '#34d399' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" style={{ color: '#555' }} />
                <span className="text-[10px]" style={{ color: '#555' }}>Offline</span>
              </>
            )}
          </div>

          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 0 20px rgba(108,93,211,0.35)',
            }}
          >
            <Plus className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: active ? '#1e1e1e' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.3)',
                fontFamily: 'var(--font-display)',
                border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6C5DD3' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(108,93,211,0.08)', border: '1px solid rgba(108,93,211,0.15)' }}
          >
            <Users2 className="w-6 h-6" style={{ color: 'rgba(108,93,211,0.6)' }} />
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)' }}
          >
            No posts yet
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-body)' }}
          >
            Be the first to share a trade or setup
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const cfg = TYPE_CFG[post.post_type] ?? TYPE_CFG.general
            const isOwn = post.user_id === myId
            return (
              <div
                key={post.id}
                className="rounded-2xl p-5 transition-all"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Author row */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(108,93,211,0.15)', color: '#8B7CF8' }}
                  >
                    T
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)' }}
                  >
                    Trader #{hashId(post.user_id)}
                    {isOwn && (
                      <span className="ml-1.5 text-[10px] font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        · you
                      </span>
                    )}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                  <span
                    className="text-[10px]"
                    style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}
                  >
                    {timeAgo(post.created_at)}
                  </span>

                  {/* Type badge */}
                  <span
                    className="ml-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-lg"
                    style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Content */}
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: 'rgba(255,255,255,0.78)', fontFamily: 'var(--font-body)' }}
                >
                  {post.content}
                </p>

                {/* Tickers */}
                {post.tickers && post.tickers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tickers.map((ticker) => (
                      <span
                        key={ticker}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          background: 'rgba(108,93,211,0.1)',
                          color: '#8B7CF8',
                          border: '1px solid rgba(108,93,211,0.2)',
                        }}
                      >
                        ${ticker}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div
                  className="flex items-center gap-4 pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <button
                    onClick={() => handleLike(post.id, !!post.liked_by_me)}
                    className="flex items-center gap-1.5 text-xs transition-all"
                    style={{
                      color: post.liked_by_me ? '#8B7CF8' : 'rgba(255,255,255,0.22)',
                      fontFamily: 'var(--font-body)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Heart
                      className="w-3.5 h-3.5 transition-all"
                      style={{ fill: post.liked_by_me ? '#8B7CF8' : 'none' }}
                    />
                    {post.like_count}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Compose modal */}
      {composing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setComposing(false) }}
        >
          <div
            className="w-full rounded-2xl p-6 animate-scale-in"
            style={{
              maxWidth: 520,
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="font-bold text-white text-base"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
              >
                New Post
              </h2>
              <button
                onClick={() => setComposing(false)}
                style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(TYPE_CFG) as PostType[]).map((t) => {
                const c = TYPE_CFG[t]
                const active = postType === t
                return (
                  <button
                    key={t}
                    onClick={() => setPostType(t)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? c.bg : 'rgba(255,255,255,0.04)',
                      color: active ? c.text : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.07)'}`,
                      fontFamily: 'var(--font-display)',
                      cursor: 'pointer',
                    }}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 1000))}
              placeholder="Share your trade setup, win, loss, or reaction to market news…&#10;&#10;Use $EURUSD, $XAUUSD etc. to tag instruments automatically."
              rows={6}
              className="w-full resize-none rounded-xl p-4 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.6',
              }}
              autoFocus
            />

            <div className="flex items-center justify-between mt-3">
              <span
                className="text-[10px]"
                style={{ color: content.length > 900 ? '#f87171' : 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-body)' }}
              >
                {content.length} / 1000
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                style={{
                  background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 0 16px rgba(108,93,211,0.3)',
                  border: 'none',
                  cursor: !content.trim() || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
