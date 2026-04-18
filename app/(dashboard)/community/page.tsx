'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  Heart, Loader2, Send, Bookmark, TrendingUp, Trophy,
  X, ImageIcon, MessageCircle,
  Pencil, Check, Search, MoreHorizontal,
  Trash2, Flag, ShieldAlert, ShieldCheck,
  UserPlus, UserCheck, Users, Sparkles, Rss,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type PostType = 'general' | 'setup' | 'win' | 'loss' | 'news_reaction'
type FeedTab = 'foryou' | 'following'

interface CommunityProfile {
  user_id?: string
  display_name: string | null
  avatar_url: string | null
  bio?: string | null
  is_public?: boolean
  follower_count?: number
  following_count?: number
  is_admin?: boolean
}

interface EnrichedPost {
  id: string
  user_id: string
  content: string
  post_type: PostType
  tickers: string[]
  like_count: number
  bookmark_count: number
  comment_count: number
  image_url: string | null
  created_at: string
  liked_by_me: boolean
  bookmarked_by_me: boolean
  reactions: Record<string, number>
  my_reaction: string | null
  profile: CommunityProfile | null
  i_follow_author: boolean
  is_my_post: boolean
}

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  profile: CommunityProfile | null
}

interface FlaggedReport {
  id: string
  reason: string
  details: string | null
  created_at: string
}
interface FlaggedGroup {
  post_id: string
  reports: FlaggedReport[]
  post: { id: string; content: string; post_type: string; created_at: string; is_removed: boolean } | null
  author_name: string | null
}
interface RemovedPost {
  id: string
  user_id: string
  content: string
  post_type: string
  created_at: string
  removed_at: string | null
  author_name: string | null
}

interface LeaderboardEntry {
  rank: number
  user_id: string
  posts: number
  likes: number
  profile: CommunityProfile | null
}

interface TrendingTag {
  tag: string
  count: number
  type: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CFG: Record<PostType, { label: string; color: string; bg: string; border: string }> = {
  general:       { label: 'General',        color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.15)' },
  setup:         { label: 'Trade Setup',    color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)'  },
  win:           { label: 'Win',            color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  loss:          { label: 'Loss',           color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  news_reaction: { label: 'News Reaction',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
}

const EMOJIS = ['🔥', '💯', '👀', '💎', '📈', '📉']

function timeAgo(s: string) {
  const secs = Math.floor((Date.now() - new Date(s).getTime()) / 1000)
  if (secs < 60) return 'now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d`
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 36 }: { profile: CommunityProfile | null; size?: number }) {
  const initials = (profile?.display_name || '?').slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: profile?.avatar_url ? 'transparent' : 'linear-gradient(135deg,#1E6EFF,#4D90FF)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(255,255,255,0.07)',
      }}
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: size * 0.33, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{initials}</span>
      }
    </div>
  )
}

// ─── Follow button ─────────────────────────────────────────────────────────────
function FollowButton({ userId, isFollowing, onChange }: { userId: string; isFollowing: boolean; onChange: (f: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/community/follow/${userId}`, { method: 'POST' })
      const d = await res.json()
      onChange(d.following)
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle() }}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        background: isFollowing ? 'rgba(255,255,255,0.06)' : 'rgba(30,110,255,0.85)',
        border: isFollowing ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(30,110,255,0.5)',
        color: isFollowing ? 'rgba(255,255,255,0.6)' : '#fff',
        minWidth: 84,
        justifyContent: 'center',
      }}
    >
      {loading ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" /> : isFollowing ? <UserCheck style={{ width: 12, height: 12 }} /> : <UserPlus style={{ width: 12, height: 12 }} />}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({
  post,
  myUserId,
  isAdmin,
  onLike,
  onBookmark,
  onReaction,
  onDelete,
  onReport,
  onFollow,
  onOpenComments,
}: {
  post: EnrichedPost
  myUserId: string
  isAdmin?: boolean
  onLike: (id: string) => void
  onBookmark: (id: string) => void
  onReaction: (id: string, emoji: string) => void
  onDelete: (id: string) => void
  onReport: (id: string) => void
  onFollow: (userId: string, following: boolean) => void
  onOpenComments: (post: EnrichedPost) => void
}) {
  const cfg = TYPE_CFG[post.post_type]
  const [showMenu, setShowMenu] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [following, setFollowing] = useState(post.i_follow_author)

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '16px 18px 14px',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar profile={post.profile} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                {post.profile?.display_name || 'Trader'}
              </span>
              {post.profile?.follower_count !== undefined && post.profile.follower_count > 0 && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
                  {fmtCount(post.profile.follower_count)} followers
                </span>
              )}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}>
                · {timeAgo(post.created_at)}
              </span>
            </div>
            {/* Post type badge */}
            <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '1px 7px', display: 'inline-block', marginTop: 2, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Follow button — only show if not my post */}
          {!post.is_my_post && (
            <FollowButton
              userId={post.user_id}
              isFollowing={following}
              onChange={(f) => { setFollowing(f); onFollow(post.user_id, f) }}
            />
          )}
          {/* Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
            >
              <MoreHorizontal style={{ width: 16, height: 16 }} />
            </button>
            {showMenu && (
              <div
                style={{ position: 'absolute', right: 0, top: 36, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '4px', zIndex: 50, minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {post.is_my_post ? (
                  <button
                    onClick={() => { onDelete(post.id); setShowMenu(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} /> Delete post
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { onReport(post.id); setShowMenu(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', color: '#fbbf24', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >
                      <Flag style={{ width: 13, height: 13 }} /> Report
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { onDelete(post.id); setShowMenu(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 2, paddingTop: 10 }}
                      >
                        <ShieldAlert style={{ width: 13, height: 13 }} /> Remove (Admin)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 10 }}>
        {post.content}
      </p>

      {/* Tickers */}
      {post.tickers?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tickers.map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(30,110,255,0.1)', color: '#4D90FF', border: '1px solid rgba(30,110,255,0.2)', fontFamily: 'var(--font-display)' }}>{t}</span>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12, maxHeight: 340, background: '#0a0a0a' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="post" loading="lazy" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Reactions row */}
      {Object.keys(post.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(post.reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReaction(post.id, emoji)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 999, fontSize: 12,
                background: post.my_reaction === emoji ? 'rgba(30,110,255,0.18)' : 'rgba(255,255,255,0.05)',
                border: post.my_reaction === emoji ? '1px solid rgba(30,110,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                color: post.my_reaction === emoji ? '#4D90FF' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
              }}
            >
              {emoji} <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4 }}>
        {/* Like */}
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: post.liked_by_me ? '#f87171' : 'rgba(255,255,255,0.35)',
            fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'color 0.15s',
          }}
        >
          <Heart style={{ width: 15, height: 15, fill: post.liked_by_me ? '#f87171' : 'none' }} />
          {post.like_count > 0 && fmtCount(post.like_count)}
        </button>

        {/* Comments */}
        <button
          onClick={() => onOpenComments(post)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
        >
          <MessageCircle style={{ width: 15, height: 15 }} />
          {post.comment_count > 0 && post.comment_count}
        </button>

        {/* Emoji picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowEmojis(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', fontSize: 14,
            }}
          >
            😊
          </button>
          {showEmojis && (
            <div style={{
              position: 'absolute', bottom: 36, left: 0, background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 10px',
              display: 'flex', gap: 6, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { onReaction(post.id, e); setShowEmojis(false) }} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, padding: 4, transition: 'transform 0.1s' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseLeave={(ev) => (ev.currentTarget.style.transform = 'scale(1)')}
                >{e}</button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark(post.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto',
            color: post.bookmarked_by_me ? '#4D90FF' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.15s',
          }}
        >
          <Bookmark style={{ width: 15, height: 15, fill: post.bookmarked_by_me ? '#4D90FF' : 'none' }} />
        </button>
      </div>
    </div>
  )
}

// ─── Compose box ──────────────────────────────────────────────────────────────
function ComposeBox({ myProfile, onPost }: { myProfile: CommunityProfile | null; onPost: (p: EnrichedPost) => void }) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<PostType>('general')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'post')
      const res = await fetch('/api/community/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { setError(d.error || 'Upload failed'); return }
      setUploadedImageUrl(d.url)
    } catch { setError('Upload failed') } finally { setUploading(false) }
    e.target.value = ''
  }

  async function submit() {
    if (!content.trim() || sending) return
    setSending(true); setError('')
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, post_type: postType, image_url: uploadedImageUrl || undefined }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || 'Failed'); return }
      onPost(d.post)
      setContent(''); setUploadedImageUrl(null)
      if (textRef.current) { textRef.current.style.height = 'auto' }
    } catch { setError('Network error') } finally { setSending(false) }
  }

  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '16px 18px', marginBottom: 4 }}>
      <div className="flex gap-3">
        <Avatar profile={myProfile} size={38} />
        <div className="flex-1 min-w-0">
          <textarea
            ref={textRef}
            value={content}
            onChange={(e) => { setContent(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px' }}
            placeholder="Share a trade, setup, or insight…"
            rows={2}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
              color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, fontFamily: 'var(--font-body)',
              caretColor: '#4D90FF',
            }}
          />
          {/* Image preview */}
          {uploadedImageUrl && (
            <div style={{ position: 'relative', display: 'inline-block', marginTop: 8, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uploadedImageUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 160, display: 'block', objectFit: 'cover' }} />
              <button
                onClick={() => setUploadedImageUrl(null)}
                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              ><X style={{ width: 10, height: 10 }} /></button>
            </div>
          )}
          {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6, fontFamily: 'var(--font-body)' }}>{error}</p>}
          {/* Hidden file input */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            {/* Post type */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['general','setup','win','loss','news_reaction'] as PostType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setPostType(t)}
                  style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                    background: postType === t ? TYPE_CFG[t].bg : 'rgba(255,255,255,0.04)',
                    border: postType === t ? `1px solid ${TYPE_CFG[t].border}` : '1px solid rgba(255,255,255,0.07)',
                    color: postType === t ? TYPE_CFG[t].color : 'rgba(255,255,255,0.3)',
                  }}
                >{TYPE_CFG[t].label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{ width: 32, height: 32, borderRadius: 8, background: (uploadedImageUrl || uploading) ? 'rgba(255,255,255,0.08)' : 'none', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', color: uploadedImageUrl ? '#4D90FF' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >{uploading ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <ImageIcon style={{ width: 15, height: 15 }} />}</button>
              <button
                onClick={submit}
                disabled={!content.trim() || sending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 999,
                  background: content.trim() ? 'rgba(30,110,255,0.9)' : 'rgba(30,110,255,0.3)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-display)', cursor: content.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                {sending ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Send style={{ width: 13, height: 13 }} />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Comments modal ───────────────────────────────────────────────────────────
function CommentsModal({ post, myProfile, onClose }: { post: EnrichedPost; myProfile: CommunityProfile | null; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const cfg = TYPE_CFG[post.post_type]

  useEffect(() => {
    fetch(`/api/community/posts/${post.id}/comments`)
      .then(r => r.json())
      .then(d => { if (d.comments) setComments(d.comments) })
      .finally(() => setLoading(false))
  }, [post.id])

  async function sendComment() {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text.trim() }),
      })
      const d = await res.json()
      if (d.comment) { setComments(p => [...p, d.comment]); setText('') }
    } finally { setSending(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'var(--font-display)' }}>{post.profile?.display_name || 'Trader'}</p>
            <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 5, padding: '1px 6px', fontFamily: 'var(--font-display)' }}>{cfg.label}</span>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}><X style={{ width: 14, height: 14 }} /></button>
        </div>
        {/* Original post */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap' }}>{post.content}</p>
        </div>
        {/* Comments */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading ? <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin w-4 h-4" style={{ color: '#1E6EFF' }} /></div> : comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: 'var(--font-body)', paddingTop: 24 }}>No comments yet. Be first.</p>
          ) : comments.map(c => (
            <div key={c.id} className="flex gap-3 mb-4">
              <Avatar profile={c.profile} size={30} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{c.profile?.display_name || 'Trader'} </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}>{timeAgo(c.created_at)}</span>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, fontFamily: 'var(--font-body)', marginTop: 2 }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <Avatar profile={myProfile} size={30} />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() } }}
            placeholder="Add a comment…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '9px 16px', fontSize: 13, color: 'rgba(255,255,255,0.85)', outline: 'none', fontFamily: 'var(--font-body)' }}
          />
          <button onClick={sendComment} disabled={!text.trim() || sending} style={{ width: 36, height: 36, borderRadius: '50%', background: text.trim() ? 'rgba(30,110,255,0.9)' : 'rgba(30,110,255,0.3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {sending ? <Loader2 style={{ width: 13, height: 13, color: '#fff' }} className="animate-spin" /> : <Send style={{ width: 13, height: 13, color: '#fff' }} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Profile editor modal ─────────────────────────────────────────────────────
function ProfileEditor({ profile, onClose, onSave }: { profile: CommunityProfile | null; onClose: () => void; onSave: (p: CommunityProfile) => void }) {
  const [form, setForm] = useState({ display_name: profile?.display_name ?? '', bio: profile?.bio ?? '', avatar_url: profile?.avatar_url ?? '' })
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/community/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (d.profile) onSave(d.profile)
    } finally { setSaving(false) }
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>Edit Profile</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X style={{ width: 13, height: 13 }} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label">Display name</label>
            <input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} maxLength={30} placeholder="Your name" className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} maxLength={150} rows={2} placeholder="Short bio…" className="input resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Avatar URL</label>
            <input value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} placeholder="https://…" className="input" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={save} disabled={saving} className="btn-blue gap-2 flex-1">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const [posts, setPosts]               = useState<EnrichedPost[]>([])
  const [loading, setLoading]           = useState(true)
  const [feedTab, setFeedTab]           = useState<FeedTab>('foryou')
  const [postTypeFilter, setPostTypeFilter] = useState<string>('all')
  const [search, setSearch]             = useState('')
  const [myProfile, setMyProfile]       = useState<CommunityProfile | null>(null)
  const [myUserId, setMyUserId]         = useState('')
  const [postCount, setPostCount]       = useState(0)
  const [leaderboard, setLeaderboard]   = useState<LeaderboardEntry[]>([])
  const [trending, setTrending]         = useState<TrendingTag[]>([])
  const [commentPost, setCommentPost]   = useState<EnrichedPost | null>(null)
  const [editProfile, setEditProfile]   = useState(false)
  const [isOnline, setIsOnline]         = useState(true)
  const [reportId, setReportId]         = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [showAdmin, setShowAdmin]       = useState(false)
  const [adminSubTab, setAdminSubTab]   = useState<'flagged' | 'removed'>('flagged')
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedGroup[]>([])
  const [removedPosts, setRemovedPosts] = useState<RemovedPost[]>([])
  const [adminLoading, setAdminLoading] = useState(false)

  const supabase  = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setMyUserId(user.id)
      const [profileRes, lbRes, trendRes] = await Promise.all([
        fetch('/api/community/profile'),
        fetch('/api/community/leaderboard'),
        fetch('/api/community/trending'),
      ])
      const profileData = await profileRes.json()
      const lbData = await lbRes.json()
      const trendData = await trendRes.json()
      setMyProfile(profileData.profile)
      setPostCount(profileData.post_count ?? 0)
      setLeaderboard(lbData.leaderboard ?? [])
      setTrending(trendData.trending ?? [])
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (feedTab === 'following') params.set('feed', 'following')
      if (postTypeFilter !== 'all') params.set('post_type', postTypeFilter)
      const res = await fetch(`/api/community/posts?${params}`)
      const d = await res.json()
      setPosts(d.posts ?? [])
    } finally { setLoading(false) }
  }, [feedTab, postTypeFilter])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Realtime
  useEffect(() => {
    channelRef.current = supabase.channel('community')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, () => { if (feedTab === 'foryou') loadPosts() })
      .subscribe((status) => setIsOnline(status === 'SUBSCRIBED'))
    return () => { channelRef.current?.unsubscribe() }
  }, [feedTab, loadPosts]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLike(postId: string) {
    await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' })
    setPosts(p => p.map(post =>
      post.id === postId ? { ...post, liked_by_me: !post.liked_by_me, like_count: post.like_count + (post.liked_by_me ? -1 : 1) } : post
    ))
  }

  async function handleBookmark(postId: string) {
    await fetch(`/api/community/posts/${postId}/bookmark`, { method: 'POST' })
    setPosts(p => p.map(post =>
      post.id === postId ? { ...post, bookmarked_by_me: !post.bookmarked_by_me, bookmark_count: post.bookmark_count + (post.bookmarked_by_me ? -1 : 1) } : post
    ))
  }

  async function handleReaction(postId: string, emoji: string) {
    await fetch(`/api/community/posts/${postId}/reactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }) })
    setPosts(p => p.map(post => {
      if (post.id !== postId) return post
      const reactions = { ...post.reactions }
      if (post.my_reaction === emoji) {
        reactions[emoji] = Math.max(0, (reactions[emoji] ?? 1) - 1)
        if (reactions[emoji] === 0) delete reactions[emoji]
        return { ...post, reactions, my_reaction: null }
      }
      if (post.my_reaction) {
        const prev = post.my_reaction
        reactions[prev] = Math.max(0, (reactions[prev] ?? 1) - 1)
        if (reactions[prev] === 0) delete reactions[prev]
      }
      reactions[emoji] = (reactions[emoji] ?? 0) + 1
      return { ...post, reactions, my_reaction: emoji }
    }))
  }

  async function handleDelete(postId: string) {
    await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' })
    setPosts(p => p.filter(post => post.id !== postId))
  }

  async function handleReport(postId: string) {
    setReportId(postId); setReportReason('')
  }

  async function submitReport() {
    if (!reportId) return
    setReportSending(true)
    try {
      await fetch(`/api/community/posts/${reportId}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: reportReason || 'inappropriate' }) })
      setReportId(null)
    } finally { setReportSending(false) }
  }

  function handleFollow(userId: string, following: boolean) {
    setPosts(p => p.map(post =>
      post.user_id === userId ? { ...post, i_follow_author: following } : post
    ))
  }

  async function loadAdminData(tab: 'flagged' | 'removed') {
    setAdminLoading(true)
    try {
      const res = await fetch(`/api/admin/moderation?type=${tab}`)
      const d = await res.json()
      if (tab === 'flagged') setFlaggedPosts(d.flagged ?? [])
      else setRemovedPosts(d.removed ?? [])
    } finally { setAdminLoading(false) }
  }

  async function adminAction(action: string, payload: Record<string, string>) {
    await fetch('/api/admin/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    })
    loadAdminData(adminSubTab)
  }

  function openAdmin() {
    setShowAdmin(true)
    loadAdminData('flagged')
  }

  const filtered = posts.filter(p => {
    if (!search) return true
    return (
      p.profile?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tickers?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const myFollowerCount = myProfile?.follower_count ?? 0
  const myFollowingCount = myProfile?.following_count ?? 0

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="page-label">Social Feed</p>
          <h1 className="page-title">Community</h1>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#34d399' : '#f87171', boxShadow: isOnline ? '0 0 8px rgba(52,211,153,0.6)' : 'none' }} />
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Main feed ── */}
        <div className="flex-1 min-w-0">
          {/* My profile banner */}
          {myProfile && (
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar profile={myProfile} size={48} />
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'var(--font-display)' }}>{myProfile.display_name || 'Set up your profile'}</p>
                {myProfile.bio && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{myProfile.bio}</p>}
                <div className="flex items-center gap-4 mt-2">
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{fmtCount(myFollowerCount)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>followers</span>
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{fmtCount(myFollowingCount)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>following</span>
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{fmtCount(postCount)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>posts</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {myProfile?.is_admin && (
                  <button
                    onClick={openAdmin}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: showAdmin ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    <ShieldCheck style={{ width: 11, height: 11 }} /> Admin
                  </button>
                )}
                <button onClick={() => setEditProfile(true)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  <Pencil style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── Admin Panel ── */}
          {showAdmin && myProfile?.is_admin && (
            <div>
              {/* Admin header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="flex items-center gap-2">
                  <ShieldAlert style={{ width: 15, height: 15, color: '#f87171' }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'var(--font-display)' }}>Admin Panel</span>
                </div>
                <button onClick={() => setShowAdmin(false)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 3 }}>
                {([
                  { key: 'flagged', label: 'Flagged Posts', count: flaggedPosts.length },
                  { key: 'removed', label: 'Removed Posts', count: removedPosts.length },
                ] as const).map(({ key, label, count }) => (
                  <button key={key} onClick={() => { setAdminSubTab(key); loadAdminData(key) }}
                    style={{
                      flex: 1, padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                      fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                      background: adminSubTab === key ? '#1e1e1e' : 'transparent',
                      color: adminSubTab === key ? '#fff' : 'rgba(255,255,255,0.3)',
                      border: adminSubTab === key ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {label}
                    {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: adminSubTab === key ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', color: adminSubTab === key ? '#f87171' : 'rgba(255,255,255,0.3)', padding: '1px 6px', borderRadius: 999 }}>{count}</span>}
                  </button>
                ))}
              </div>

              {adminLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1E6EFF' }} />
                </div>
              ) : adminSubTab === 'flagged' ? (
                flaggedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShieldCheck style={{ width: 32, height: 32, color: 'rgba(52,211,153,0.3)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)' }}>No flagged posts</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {flaggedPosts.map(group => (
                      <div key={group.post_id} style={{ background: '#111', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 14, padding: '14px 16px' }}>
                        {/* Report badges */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {group.reports.map(r => (
                            <span key={r.id} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)', color: '#fbbf24', fontFamily: 'var(--font-display)' }}>
                              {r.reason}
                            </span>
                          ))}
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)', marginLeft: 4 }}>
                            {group.reports.length} report{group.reports.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {/* Post content */}
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', lineHeight: 1.55, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {group.post?.content ?? '[post unavailable]'}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
                          by {group.author_name ?? 'Unknown'}{group.post?.is_removed ? ' · already removed' : ''}
                        </p>
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!group.post?.is_removed && (
                            <button
                              onClick={() => adminAction('remove_post', { post_id: group.post_id })}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
                            >
                              <Trash2 style={{ width: 11, height: 11 }} /> Remove Post
                            </button>
                          )}
                          <button
                            onClick={() => adminAction('dismiss_all', { post_id: group.post_id })}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
                          >
                            <Check style={{ width: 11, height: 11 }} /> Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                removedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Trash2 style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.1)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)' }}>No removed posts</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {removedPosts.map(p => (
                      <div key={p.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', opacity: 0.85 }}>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', lineHeight: 1.55, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.content}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
                          by {p.author_name ?? 'Unknown'} · removed {p.removed_at ? new Date(p.removed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </p>
                        <button
                          onClick={() => adminAction('restore_post', { post_id: p.id })}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
                        >
                          <Check style={{ width: 11, height: 11 }} /> Restore Post
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* Compose + Feed (hidden when admin panel is open) */}
          {!showAdmin && <>
          <ComposeBox
            myProfile={myProfile}
            onPost={(p) => { setPosts(prev => [p, ...prev]); setPostCount(c => c + 1) }}
          />

          {/* Feed tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '16px 0 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
            {([
              { key: 'foryou', label: 'For You', icon: Sparkles },
              { key: 'following', label: 'Following', icon: Rss },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFeedTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: feedTab === key ? '#fff' : 'rgba(255,255,255,0.35)',
                  borderBottom: feedTab === key ? '2px solid #4D90FF' : '2px solid transparent',
                  marginBottom: -1, transition: 'color 0.15s',
                }}
              >
                <Icon style={{ width: 13, height: 13 }} />{label}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#444' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts, traders…"
                className="input !pl-9 !min-h-0 !py-2 !text-xs !rounded-xl"
              />
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 3 }}>
              {(['all','win','loss','setup'] as const).map(f => (
                <button key={f} onClick={() => setPostTypeFilter(f)}
                  style={{
                    padding: '4px 11px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-display)', background: postTypeFilter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: postTypeFilter === f ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', textTransform: 'capitalize',
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1E6EFF' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(30,110,255,0.08)', border: '1px solid rgba(30,110,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {feedTab === 'following' ? <Rss style={{ width: 20, height: 20, color: 'rgba(30,110,255,0.6)' }} /> : <Users style={{ width: 20, height: 20, color: 'rgba(30,110,255,0.6)' }} />}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {feedTab === 'following' ? "You're not following anyone yet" : 'No posts yet'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, fontFamily: 'var(--font-body)', marginTop: 6 }}>
                {feedTab === 'following' ? 'Follow traders from the For You feed to see their posts here' : 'Be the first to share a trade or insight'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  myUserId={myUserId}
                  isAdmin={myProfile?.is_admin}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onReaction={handleReaction}
                  onDelete={handleDelete}
                  onReport={handleReport}
                  onFollow={handleFollow}
                  onOpenComments={setCommentPost}
                />
              ))}
            </div>
          )}
          </>}
        </div>

        {/* ── Right sidebar (desktop only) ── */}
        <aside className="hidden lg:flex flex-col gap-4" style={{ width: 280, flexShrink: 0 }}>
          {/* Discord community card */}
          <a
            href="https://discord.gg/uzyjZbRp8S"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(88,101,242,0.12) 0%, rgba(30,110,255,0.08) 100%)',
              border: '1px solid rgba(88,101,242,0.25)',
              borderRadius: 16, padding: '16px 18px',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(88,101,242,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(88,101,242,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.discordapp.com/icons/1450169178987434024/cfad1572b4cffa17b78bd05b75b2c13c.webp?size=1024"
                alt="DMFX Discord"
                style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: '2px solid rgba(88,101,242,0.3)' }}
              />
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>The DMFX Trading Zone</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', marginTop: 2 }}>Official Discord Server</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', lineHeight: 1.5, marginBottom: 12 }}>
              Connect with traders, share ideas, and be part of the community.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 0', borderRadius: 10, background: 'rgba(88,101,242,0.85)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.4a.22.22 0 0 0-.23.1 40.8 40.8 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0 37.5 37.5 0 0 0-1.8-3.7.23.23 0 0 0-.23-.1A58.4 58.4 0 0 0 10.5 4.9a.2.2 0 0 0-.1.08C1.6 18.1-.95 31 .3 43.7a.24.24 0 0 0 .09.17 58.9 58.9 0 0 0 17.7 9 .23.23 0 0 0 .25-.08 42 42 0 0 0 3.6-5.9.22.22 0 0 0-.12-.31 38.8 38.8 0 0 1-5.5-2.6.23.23 0 0 1-.02-.38c.37-.28.74-.57 1.1-.86a.22.22 0 0 1 .23-.03c11.6 5.3 24.1 5.3 35.5 0a.22.22 0 0 1 .23.03c.36.29.73.58 1.1.86a.23.23 0 0 1-.02.38 36 36 0 0 1-5.5 2.6.22.22 0 0 0-.12.31 47.2 47.2 0 0 0 3.6 5.9c.06.1.17.13.25.08a58.7 58.7 0 0 0 17.7-9 .23.23 0 0 0 .09-.16C72.9 29.3 69 16.5 60.2 5a.18.18 0 0 0-.1-.09ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.2-6.4 7.2Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.2-6.4 7.2Z"/>
              </svg>
              Join Discord
            </div>
          </a>

          {/* Trending tags */}
          {trending.length > 0 && (
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Trending</p>
              {trending.slice(0, 8).map((t, i) => (
                <div key={t.tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < Math.min(trending.length, 8) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>{t.tag}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>{t.count} posts</p>
                  </div>
                  <TrendingUp style={{ width: 14, height: 14, color: '#34d399' }} />
                </div>
              ))}
            </div>
          )}

          {/* Top traders leaderboard */}
          {leaderboard.length > 0 && (
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Top Traders</p>
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < Math.min(leaderboard.length, 5) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'rgba(255,255,255,0.25)', width: 18, textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <Avatar profile={entry.profile} size={30} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.profile?.display_name || 'Trader'}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>{entry.likes} likes · {entry.posts} posts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* ── Comments modal ── */}
      {commentPost && <CommentsModal post={commentPost} myProfile={myProfile} onClose={() => setCommentPost(null)} />}

      {/* ── Profile editor modal ── */}
      {editProfile && <ProfileEditor profile={myProfile} onClose={() => setEditProfile(false)} onSave={(p) => { setMyProfile(p); setEditProfile(false) }} />}

      {/* ── Report modal ── */}
      {reportId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: 16 }} onClick={() => setReportId(null)}>
          <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 380, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flag style={{ width: 16, height: 16, color: '#fbbf24' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'var(--font-display)' }}>Report Post</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>Help keep the community safe</p>
              </div>
            </div>
            <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="What's wrong with this post? (optional)" rows={3} className="input resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={submitReport} disabled={reportSending} className="btn-blue gap-2 flex-1">
                {reportSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Report
              </button>
              <button onClick={() => setReportId(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
