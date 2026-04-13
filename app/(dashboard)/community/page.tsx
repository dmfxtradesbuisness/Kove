'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Heart, Loader2, Send, Bookmark, User, TrendingUp, Trophy, X, Wifi } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Utils ────────────────────────────────────────────────────────────────────
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return Math.abs(h) % 9000 + 1000
}

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}

const TYPE_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'setup',         label: 'Setup' },
  { key: 'win',           label: 'Win' },
  { key: 'loss',          label: 'Loss' },
  { key: 'news_reaction', label: 'News' },
]

const TRENDING = [
  { tag: '#XAUUSD',  count: '142 posts' },
  { tag: '#EURUSD',  count: '98 posts' },
  { tag: '#NAS100',  count: '76 posts' },
  { tag: '#Setups',  count: '61 posts' },
  { tag: '#FedRate', count: '44 posts' },
]

const POST_TYPE_CFG = {
  general:       { label: 'General',  color: '#888' },
  setup:         { label: 'Setup',    color: '#a78bfa' },
  win:           { label: 'Win',      color: '#34d399' },
  loss:          { label: 'Loss',     color: '#f87171' },
  news_reaction: { label: 'News',     color: '#fbbf24' },
}

// ─── Decorative swooshes (matching reference) ─────────────────────────────────
function Swooshes() {
  return (
    <>
      {/* Top-right diagonal shapes */}
      <div style={{
        position: 'absolute', top: -40, right: -30, width: 420, height: 320,
        background: 'linear-gradient(135deg, rgba(80,60,200,0.45) 0%, rgba(50,30,160,0.2) 60%, transparent 100%)',
        borderRadius: '0 0 0 80%',
        transform: 'rotate(-12deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 60, right: 40, width: 300, height: 200,
        background: 'linear-gradient(135deg, rgba(90,65,210,0.35) 0%, rgba(60,40,170,0.15) 60%, transparent 100%)',
        borderRadius: '0 0 0 60%',
        transform: 'rotate(-8deg)',
        pointerEvents: 'none',
      }} />
      {/* Bottom swoosh */}
      <div style={{
        position: 'absolute', bottom: -60, left: '30%', width: 500, height: 200,
        background: 'linear-gradient(135deg, rgba(70,50,190,0.3) 0%, transparent 70%)',
        borderRadius: '60% 0 0 0',
        transform: 'rotate(6deg)',
        pointerEvents: 'none',
      }} />
    </>
  )
}

// ─── Post Card ───────────────────────────────────────────────────────────────
function PostCard({ post, myId, onLike }: {
  post: Post
  myId: string | null
  onLike: (id: string, liked: boolean) => void
}) {
  const num  = hashId(post.user_id)
  const cfg  = POST_TYPE_CFG[post.post_type] ?? POST_TYPE_CFG.general
  const isOwn = post.user_id === myId

  return (
    <div style={{
      background: '#07060e',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '18px 20px',
      position: 'relative',
      marginBottom: 14,
    }}>
      {/* Top row: avatar + name + timestamp */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#3d38c0,#2a25a0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 15, color: '#fff',
              }}>
                User{num}
                {isOwn && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: 6 }}>
                    · you
                  </span>
                )}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: cfg.color,
                fontFamily: 'var(--font-display)',
              }}>
                {cfg.label}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
              {timeAgo(post.created_at)}
            </span>
          </div>

          {/* Content */}
          <p style={{
            fontSize: 14, lineHeight: '1.6', color: 'rgba(255,255,255,0.75)',
            fontFamily: 'var(--font-body)', marginTop: 10,
            paddingRight: 36,
          }}>
            {post.content}
          </p>

          {/* Tickers */}
          {post.tickers && post.tickers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tickers.map((t) => (
                <span key={t} style={{
                  fontSize: 10, fontWeight: 700, color: '#8B7CF8',
                  background: 'rgba(108,93,211,0.12)',
                  border: '1px solid rgba(108,93,211,0.22)',
                  borderRadius: 6, padding: '2px 7px',
                  fontFamily: 'var(--font-display)',
                }}>${t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bookmark + Heart — fixed bottom-right like reference */}
      <div style={{
        position: 'absolute', right: 18, bottom: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2 }}>
          <Bookmark className="w-4 h-4" />
        </button>
        <button
          onClick={() => onLike(post.id, !!post.liked_by_me)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: post.liked_by_me ? '#8B7CF8' : 'rgba(255,255,255,0.35)',
            padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}
        >
          <Heart
            className="w-5 h-5"
            style={{ fill: post.liked_by_me ? '#8B7CF8' : 'none', stroke: 'currentColor' }}
          />
          {post.like_count > 0 && (
            <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {post.like_count}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const supabase = createClient()

  const [posts, setPosts]             = useState<Post[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [myId, setMyId]               = useState<string | null>(null)
  const [live, setLive]               = useState(false)
  const [composing, setComposing]     = useState(false)
  const [content, setContent]         = useState('')
  const [postType, setPostType]       = useState<PostType>('general')
  const [submitting, setSubmitting]   = useState(false)
  const channelRef                    = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = useCallback(async (f: string) => {
    setLoading(true)
    try {
      const params = f !== 'all' ? `?post_type=${f}` : ''
      const json = await fetch(`/api/community/posts${params}`).then(r => r.json())
      setPosts(json.posts ?? [])
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPosts(filter) }, [filter, fetchPosts])

  useEffect(() => {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
    const ch = supabase.channel('community_v4')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        const p = payload.new as Post
        if (filter !== 'all' && p.post_type !== filter) return
        setPosts(prev => prev.some(x => x.id === p.id) ? prev : [{ ...p, liked_by_me: false }, ...prev])
      })
      .subscribe(status => setLive(status === 'SUBSCRIBED'))
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = async (postId: string, liked: boolean) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked_by_me: !liked, like_count: liked ? p.like_count - 1 : p.like_count + 1 } : p
    ))
    await fetch(`/api/community/posts/${postId}/like`, { method: liked ? 'DELETE' : 'POST' })
  }

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
        setPosts(prev => {
          if (prev.some(p => p.id === json.post.id)) return prev
          if (filter !== 'all' && json.post.post_type !== filter) return prev
          return [json.post, ...prev]
        })
      }
      setContent(''); setPostType('general'); setComposing(false)
    } finally { setSubmitting(false) }
  }

  const myNum = myId ? hashId(myId) : 1234

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #12103a 0%, #1a1260 35%, #16104e 60%, #0f0c38 100%)',
      overflow: 'hidden',
    }}>
      <Swooshes />

      <div
        className="relative flex gap-0"
        style={{ zIndex: 1, minHeight: '100vh', padding: '32px 28px 40px' }}
      >

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={{ width: 180, flexShrink: 0, marginRight: 28 }}>
          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'rgba(200,200,210,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <User className="w-10 h-10" style={{ color: '#555' }} />
          </div>

          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 15, color: '#fff', marginBottom: 28,
          }}>
            User{myNum}
          </p>

          {/* Live dot */}
          {live && (
            <div className="flex items-center gap-1.5 mb-4">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Live</span>
            </div>
          )}

          {/* Filter pills */}
          <div className="flex flex-col gap-2.5">
            {/* All */}
            <button
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'rgba(108,93,211,0.25)' : 'rgba(255,255,255,0.07)',
                border: filter === 'all' ? '1px solid rgba(108,93,211,0.4)' : '1px solid rgba(255,255,255,0.09)',
                borderRadius: 999, padding: '8px 20px',
                color: filter === 'all' ? '#c4b8ff' : 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              All
            </button>

            {TYPE_FILTERS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  background: filter === tab.key ? 'rgba(108,93,211,0.25)' : 'rgba(255,255,255,0.07)',
                  border: filter === tab.key ? '1px solid rgba(108,93,211,0.4)' : '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 999, padding: '8px 20px',
                  color: filter === tab.key ? '#c4b8ff' : 'rgba(255,255,255,0.6)',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* New Post button */}
          <button
            onClick={() => setComposing(true)}
            style={{
              marginTop: 28,
              background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
              border: 'none',
              borderRadius: 999, padding: '10px 20px',
              color: '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', width: '100%',
              boxShadow: '0 0 20px rgba(108,93,211,0.4)',
            }}
          >
            + New Post
          </button>
        </div>

        {/* ── CENTER FEED ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, marginRight: 24 }}>
          {/* Heading */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 28, color: '#fff', letterSpacing: '-0.02em',
            marginBottom: 10,
          }}>
            Community Kove
          </h1>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 22 }} />

          {/* Feed */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#7B6CF5' }} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', fontSize: 14 }}>
                No posts yet — be the first to share
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} myId={myId} onLike={handleLike} />
            ))
          )}
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={{ width: 220, flexShrink: 0 }}>

          {/* Trending Topics */}
          <div style={{
            background: 'rgba(20,15,65,0.8)',
            border: '1px solid rgba(108,93,211,0.2)',
            borderRadius: 18, padding: '18px 18px 14px',
            marginBottom: 16, backdropFilter: 'blur(12px)',
          }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: '#8B7CF8' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                Trending Topics
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {TRENDING.map((t) => (
                <div key={t.tag} className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#8B7CF8' }}>
                    {t.tag}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Leaderboard */}
          <div style={{
            background: 'rgba(20,15,65,0.8)',
            border: '1px solid rgba(108,93,211,0.2)',
            borderRadius: 18, padding: '18px 18px 14px',
            backdropFilter: 'blur(12px)',
          }}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                Community Leaderboard
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center gap-2.5">
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                    color: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.25)',
                    width: 16, textAlign: 'center',
                  }}>
                    {rank}
                  </span>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#3d38c0,#2a25a0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1 }}>
                      Trader #{1000 + rank * 337 % 9000}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                      {32 - rank * 4} posts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Compose modal ──────────────────────────────────────────────────────── */}
      {composing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setComposing(false) }}
        >
          <div style={{
            width: '100%', maxWidth: 500,
            background: '#0d0b28',
            border: '1px solid rgba(108,93,211,0.3)',
            borderRadius: 22, padding: 28,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff' }}>
                New Post
              </h2>
              <button onClick={() => setComposing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.entries(POST_TYPE_CFG) as [PostType, typeof POST_TYPE_CFG[PostType]][]).map(([t, c]) => (
                <button
                  key={t}
                  onClick={() => setPostType(t)}
                  style={{
                    background: postType === t ? 'rgba(108,93,211,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${postType === t ? 'rgba(108,93,211,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 999, padding: '6px 14px',
                    color: postType === t ? c.color : 'rgba(255,255,255,0.35)',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 1000))}
              placeholder="Share your setup, win, loss, or market reaction…"
              rows={5}
              style={{
                width: '100%', resize: 'none', outline: 'none',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '14px 16px',
                color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '1.6',
              }}
              autoFocus
            />

            <div className="flex items-center justify-between mt-3">
              <span style={{ fontSize: 10, color: content.length > 900 ? '#f87171' : 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
                {content.length} / 1000
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
                  border: 'none', borderRadius: 12,
                  padding: '10px 22px', color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  cursor: !content.trim() || submitting ? 'not-allowed' : 'pointer',
                  opacity: !content.trim() || submitting ? 0.5 : 1,
                  boxShadow: '0 0 20px rgba(108,93,211,0.35)',
                }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
