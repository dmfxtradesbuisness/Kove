'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Heart, Loader2, Send, MessageCircle, Share2, MoreHorizontal, Smile, Mic, Wifi, WifiOff } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
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
  general:       { label: 'Trader',         text: '#888',      bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.08)' },
  setup:         { label: 'Setup',          text: '#a78bfa',   bg: 'rgba(139,92,246,0.12)',    border: 'rgba(139,92,246,0.22)' },
  win:           { label: 'Win 🎯',         text: '#34d399',   bg: 'rgba(52,211,153,0.12)',    border: 'rgba(52,211,153,0.22)' },
  loss:          { label: 'Loss 📉',        text: '#f87171',   bg: 'rgba(248,113,113,0.12)',   border: 'rgba(248,113,113,0.22)' },
  news_reaction: { label: 'News Reaction',  text: '#fbbf24',   bg: 'rgba(251,191,36,0.12)',    border: 'rgba(251,191,36,0.22)' },
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  'linear-gradient(135deg,#06b6d4,#0284c7)',
  'linear-gradient(135deg,#ec4899,#db2777)',
  'linear-gradient(135deg,#f97316,#ea580c)',
]

const MAIN_TABS = [
  { key: 'all',           label: 'For You' },
  { key: 'setup',         label: 'Setups' },
  { key: 'win',           label: 'Wins' },
  { key: 'loss',          label: 'Losses' },
  { key: 'news_reaction', label: 'News' },
]

// ─── Utils ────────────────────────────────────────────────────────────────────
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return Math.abs(h) % 9000 + 1000
}
function avatarGradient(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}
function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

/** Wrap $TICKER and #hashtag patterns with a violet highlight span */
function renderContent(text: string): React.ReactNode[] {
  const parts = text.split(/(\$[A-Z]{2,10})/g)
  return parts.map((part, i) =>
    /^\$[A-Z]{2,10}$/.test(part) ? (
      <span key={i} style={{ color: '#8B7CF8', fontWeight: 600 }}>{part}</span>
    ) : (
      part
    )
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const supabase = createClient()

  const [posts, setPosts]             = useState<Post[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [content, setContent]         = useState('')
  const [postType, setPostType]       = useState<PostType>('general')
  const [submitting, setSubmitting]   = useState(false)
  const [myId, setMyId]               = useState<string | null>(null)
  const [live, setLive]               = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const channelRef                    = useRef<RealtimeChannel | null>(null)
  const textareaRef                   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = useCallback(async (activeFilter: string) => {
    setLoading(true)
    try {
      const params = activeFilter !== 'all' ? `?post_type=${activeFilter}` : ''
      const res  = await fetch(`/api/community/posts${params}`)
      const json = await res.json()
      setPosts(json.posts ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts(filter) }, [filter, fetchPosts])

  // Realtime
  useEffect(() => {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
    const ch = supabase
      .channel('community_feed_v3')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        const p = payload.new as Post
        if (filter !== 'all' && p.post_type !== filter) return
        setPosts((prev) => prev.some((x) => x.id === p.id) ? prev : [{ ...p, liked_by_me: false }, ...prev])
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const res  = await fetch('/api/community/posts', {
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
      setComposeOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId: string, liked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: !liked, like_count: liked ? p.like_count - 1 : p.like_count + 1 }
          : p
      )
    )
    await fetch(`/api/community/posts/${postId}/like`, { method: liked ? 'DELETE' : 'POST' })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, paddingBottom: 80 }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 pt-7 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div>
          <h1
            className="text-2xl font-black text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Community
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#555', fontFamily: 'var(--font-body)' }}>
            Anonymous trading feed
          </p>
        </div>

        {/* Live badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{
            background: live ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${live ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          {live ? (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
              />
              <Wifi className="w-3 h-3" style={{ color: '#34d399' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#34d399', fontFamily: 'var(--font-display)' }}>
                Live
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" style={{ color: '#555' }} />
              <span className="text-[10px]" style={{ color: '#555' }}>Connecting</span>
            </>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div
        className="flex px-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {MAIN_TABS.map((tab) => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="relative py-3.5 px-4 text-sm font-semibold transition-colors"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.28)',
                fontFamily: 'var(--font-display)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg,#7B6CF5,#5C4ED4)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Inline compose bar ────────────────────────────────────────────── */}
      <div
        className="mx-6 mt-5 mb-2 rounded-2xl overflow-hidden"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-start gap-3 p-4">
          {/* My avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
            style={{
              background: myId ? avatarGradient(myId) : 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
              color: '#fff',
            }}
          >
            {myId ? String(hashId(myId)).charAt(0) : 'T'}
          </div>

          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onFocus={() => setComposeOpen(true)}
              onChange={(e) => setContent(e.target.value.slice(0, 1000))}
              placeholder="What's on your mind right now?"
              rows={composeOpen ? 4 : 1}
              className="w-full resize-none outline-none text-sm"
              style={{
                background: 'transparent',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.6',
                border: 'none',
              }}
            />

            {/* Expanded: type selector */}
            {composeOpen && (
              <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
                {(Object.entries(TYPE_CFG) as [PostType, typeof TYPE_CFG[PostType]][]).map(([t, c]) => (
                  <button
                    key={t}
                    onClick={() => setPostType(t)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                    style={{
                      background: postType === t ? c.bg : 'rgba(255,255,255,0.04)',
                      color: postType === t ? c.text : 'rgba(255,255,255,0.28)',
                      border: `1px solid ${postType === t ? c.border : 'rgba(255,255,255,0.07)'}`,
                      fontFamily: 'var(--font-display)',
                      cursor: 'pointer',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom toolbar */}
        <div
          className="flex items-center justify-between px-4 pb-3"
          style={{ borderTop: composeOpen ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingTop: composeOpen ? 10 : 0 }}
        >
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#8B7CF8')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#8B7CF8')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
            >
              <Mic className="w-4 h-4" />
            </button>
            {composeOpen && content.length > 0 && (
              <span
                className="text-[10px] ml-1"
                style={{
                  color: content.length > 900 ? '#f87171' : 'rgba(255,255,255,0.18)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {content.length}/1000
              </span>
            )}
          </div>

          {composeOpen && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setComposeOpen(false); setContent('') }}
                className="text-xs px-3 py-1.5 rounded-xl font-medium"
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
                  color: '#fff',
                  border: 'none',
                  cursor: !content.trim() || submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 0 16px rgba(108,93,211,0.3)',
                }}
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Feed ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6C5DD3' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 px-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(108,93,211,0.08)', border: '1px solid rgba(108,93,211,0.14)' }}
          >
            <MessageCircle className="w-6 h-6" style={{ color: 'rgba(108,93,211,0.5)' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-display)' }}>
            No posts yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-body)' }}>
            Be the first to share a setup or insight
          </p>
        </div>
      ) : (
        <div className="flex flex-col mt-3">
          {posts.map((post) => {
            const cfg   = TYPE_CFG[post.post_type] ?? TYPE_CFG.general
            const isOwn = post.user_id === myId
            const num   = hashId(post.user_id)
            const grad  = avatarGradient(post.user_id)

            return (
              <div
                key={post.id}
                className="px-6 py-5 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.015)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: grad, color: '#fff' }}
                  >
                    {String(num).charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Author row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
                        >
                          Trader #{num}
                          {isOwn && (
                            <span
                              className="ml-1.5 text-[10px] font-normal"
                              style={{ color: 'rgba(255,255,255,0.22)' }}
                            >
                              · you
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
                            · {timeAgo(post.created_at)}
                          </span>
                        </div>
                      </div>

                      <button
                        style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <p
                      className="text-sm leading-relaxed mt-2"
                      style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-body)' }}
                    >
                      {renderContent(post.content)}
                    </p>

                    {/* Ticker chips */}
                    {post.tickers && post.tickers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {post.tickers.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              background: 'rgba(108,93,211,0.1)',
                              color: '#8B7CF8',
                              border: '1px solid rgba(108,93,211,0.2)',
                            }}
                          >
                            ${t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action row */}
                    <div className="flex items-center gap-1 mt-3">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(post.id, !!post.liked_by_me)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: post.liked_by_me ? 'rgba(108,93,211,0.12)' : 'transparent',
                          color: post.liked_by_me ? '#8B7CF8' : 'rgba(255,255,255,0.28)',
                          border: `1px solid ${post.liked_by_me ? 'rgba(108,93,211,0.22)' : 'transparent'}`,
                          fontFamily: 'var(--font-display)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!post.liked_by_me) {
                            ;(e.currentTarget as HTMLElement).style.background = 'rgba(108,93,211,0.08)'
                            ;(e.currentTarget as HTMLElement).style.color = '#8B7CF8'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!post.liked_by_me) {
                            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'
                          }
                        }}
                      >
                        <Heart
                          className="w-3.5 h-3.5"
                          style={{ fill: post.liked_by_me ? '#8B7CF8' : 'none', stroke: 'currentColor' }}
                        />
                        {post.like_count > 0 ? `${post.like_count} Like${post.like_count !== 1 ? 's' : ''}` : 'Like'}
                      </button>

                      {/* Comment (static UI) */}
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: 'transparent',
                          color: 'rgba(255,255,255,0.28)',
                          border: '1px solid transparent',
                          fontFamily: 'var(--font-display)',
                          cursor: 'default',
                        }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Comment
                      </button>

                      {/* Share (static UI) */}
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: 'transparent',
                          color: 'rgba(255,255,255,0.28)',
                          border: '1px solid transparent',
                          fontFamily: 'var(--font-display)',
                          cursor: 'default',
                        }}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
