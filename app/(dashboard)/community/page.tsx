'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  Heart, Loader2, Send, Bookmark, User, TrendingUp, Trophy,
  X, Wifi, WifiOff, ImageIcon, MessageCircle, ChevronDown,
  ChevronUp, Camera, Pencil, Check, Search, MoreHorizontal,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type PostType = 'general' | 'setup' | 'win' | 'loss' | 'news_reaction'

interface CommunityProfile {
  user_id?: string
  display_name: string | null
  avatar_url: string | null
  bio?: string | null
  is_public?: boolean
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
}

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  profile: CommunityProfile | null
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
  general:       { label: 'General',  color: '#888',    bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  setup:         { label: 'Setup',    color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)' },
  win:           { label: 'Win',      color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)' },
  loss:          { label: 'Loss',     color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
  news_reaction: { label: 'News',     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)' },
}

const REACTIONS = ['❤️', '🔥', '💯', '📈', '📉']

const TYPE_FILTERS = [
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

function timeAgo(d: string): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

function displayName(profile: CommunityProfile | null, userId: string): string {
  return profile?.display_name || `Trader #${hashId(userId)}`
}

function Avatar({ profile, userId, size = 40 }: { profile: CommunityProfile | null; userId: string; size?: number }) {
  const letter = (profile?.display_name?.[0] ?? 'T').toUpperCase()
  if (profile?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={displayName(profile, userId)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#3d38c0,#2a25a0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
      fontFamily: 'var(--font-display)',
    }}>
      {letter}
    </div>
  )
}

// ─── Decorative swooshes ──────────────────────────────────────────────────────
function Swooshes() {
  return (
    <>
      <div style={{ position:'absolute',top:-40,right:-30,width:420,height:320,background:'linear-gradient(135deg,rgba(80,60,200,0.45),rgba(50,30,160,0.2) 60%,transparent)',borderRadius:'0 0 0 80%',transform:'rotate(-12deg)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',top:60,right:40,width:300,height:200,background:'linear-gradient(135deg,rgba(90,65,210,0.35),rgba(60,40,170,0.15) 60%,transparent)',borderRadius:'0 0 0 60%',transform:'rotate(-8deg)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:-60,left:'30%',width:500,height:200,background:'linear-gradient(135deg,rgba(70,50,190,0.3),transparent 70%)',borderRadius:'60% 0 0 0',transform:'rotate(6deg)',pointerEvents:'none' }}/>
    </>
  )
}

// ─── Post card component ──────────────────────────────────────────────────────
function PostCard({
  post, myId,
  onLike, onBookmark, onReact,
  commentsOpen, onToggleComments,
  comments, commentInput, onCommentInput, onCommentSubmit, submittingComment,
}: {
  post: EnrichedPost; myId: string | null
  onLike: (id: string, liked: boolean) => void
  onBookmark: (id: string, bookmarked: boolean) => void
  onReact: (id: string, emoji: string, current: string | null) => void
  commentsOpen: boolean; onToggleComments: () => void
  comments: Comment[]; commentInput: string
  onCommentInput: (v: string) => void
  onCommentSubmit: (postId: string) => void
  submittingComment: boolean
}) {
  const [showReactions, setShowReactions] = useState(false)
  const cfg  = TYPE_CFG[post.post_type] ?? TYPE_CFG.general
  const name = displayName(post.profile, post.user_id)

  return (
    <div style={{ background:'#07060e', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, marginBottom:14, overflow:'hidden' }}>
      {/* Header */}
      <div className="flex items-start gap-3 p-5">
        <Avatar profile={post.profile} userId={post.user_id} size={44} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#fff' }}>
                {name}
                {post.user_id === myId && (
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:400, marginLeft:5 }}>you</span>
                )}
              </span>
              <span style={{ fontSize:10, fontWeight:700, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:6, padding:'2px 7px', fontFamily:'var(--font-display)' }}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.28)', fontFamily:'var(--font-body)' }}>
                {timeAgo(post.created_at)}
              </span>
              <button style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.22)', padding:2 }}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <p style={{ fontSize:14, lineHeight:'1.65', color:'rgba(255,255,255,0.78)', fontFamily:'var(--font-body)', marginTop:8 }}>
            {post.content}
          </p>

          {/* Tickers */}
          {post.tickers?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tickers.map(t => (
                <span key={t} style={{ fontSize:10, fontWeight:700, color:'#8B7CF8', background:'rgba(108,93,211,0.12)', border:'1px solid rgba(108,93,211,0.22)', borderRadius:6, padding:'2px 7px', fontFamily:'var(--font-display)' }}>
                  ${t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div style={{ paddingLeft:16, paddingRight:16, paddingBottom:12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt="Post image"
            style={{ width:'100%', borderRadius:12, maxHeight:360, objectFit:'cover', border:'1px solid rgba(255,255,255,0.06)' }}
          />
        </div>
      )}

      {/* Reactions row (if any exist) */}
      {Object.keys(post.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-3">
          {Object.entries(post.reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(post.id, emoji, post.my_reaction)}
              style={{
                display:'flex', alignItems:'center', gap:4,
                fontSize:12, padding:'3px 8px', borderRadius:20,
                background: post.my_reaction === emoji ? 'rgba(108,93,211,0.22)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${post.my_reaction === emoji ? 'rgba(108,93,211,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color:'rgba(255,255,255,0.75)', cursor:'pointer', fontFamily:'var(--font-body)',
              }}
            >
              {emoji} <span style={{ fontSize:10, fontWeight:700 }}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'10px 16px', display:'flex', alignItems:'center', gap:4, position:'relative' }}>

        {/* Like */}
        <ActionBtn
          icon={<Heart className="w-3.5 h-3.5" style={{ fill: post.liked_by_me ? '#8B7CF8' : 'none', stroke:'currentColor' }}/>}
          label={post.like_count > 0 ? String(post.like_count) : 'Like'}
          active={post.liked_by_me}
          onClick={() => onLike(post.id, post.liked_by_me)}
        />

        {/* Comment */}
        <ActionBtn
          icon={<MessageCircle className="w-3.5 h-3.5"/>}
          label={post.comment_count > 0 ? `${post.comment_count} Comment${post.comment_count !== 1 ? 's' : ''}` : 'Comment'}
          onClick={onToggleComments}
          active={commentsOpen}
        />

        {/* React */}
        <div style={{ position:'relative' }}>
          <ActionBtn
            icon={<span style={{ fontSize:13 }}>{post.my_reaction ?? '😊'}</span>}
            label="React"
            onClick={() => setShowReactions(v => !v)}
            active={!!post.my_reaction}
          />
          {showReactions && (
            <div
              style={{
                position:'absolute', bottom:'calc(100% + 6px)', left:0, zIndex:50,
                background:'#1a1638', border:'1px solid rgba(108,93,211,0.3)',
                borderRadius:14, padding:'8px 10px', display:'flex', gap:6,
                boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {REACTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => { onReact(post.id, e, post.my_reaction); setShowReactions(false) }}
                  style={{ fontSize:20, background:'none', border:'none', cursor:'pointer', padding:2, borderRadius:6, transition:'transform 0.1s' }}
                  onMouseEnter={ev => (ev.currentTarget.style.transform='scale(1.3)')}
                  onMouseLeave={ev => (ev.currentTarget.style.transform='scale(1)')}
                >
                  {e}
                </button>
              ))}
              {post.my_reaction && (
                <button
                  onClick={() => { onReact(post.id, post.my_reaction!, post.my_reaction); setShowReactions(false) }}
                  style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer', paddingLeft:4 }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* Bookmark */}
        <button
          onClick={() => onBookmark(post.id, post.bookmarked_by_me)}
          className="flex items-center gap-1.5"
          style={{
            background:'none', border:'none', cursor:'pointer',
            color: post.bookmarked_by_me ? '#fbbf24' : 'rgba(255,255,255,0.3)',
            fontSize:11, fontFamily:'var(--font-display)', fontWeight:600, padding:'6px 8px', borderRadius:10,
          }}
        >
          <Bookmark className="w-3.5 h-3.5" style={{ fill: post.bookmarked_by_me ? '#fbbf24' : 'none' }}/>
          {post.bookmark_count > 0 && post.bookmark_count}
        </button>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'12px 16px' }}>
          {comments.length === 0 ? (
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)', fontFamily:'var(--font-body)', textAlign:'center', padding:'8px 0' }}>
              No comments yet — be first
            </p>
          ) : (
            <div className="flex flex-col gap-3 mb-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <Avatar profile={c.profile} userId={c.user_id} size={28}/>
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'7px 11px', flex:1 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.7)', fontFamily:'var(--font-display)' }}>
                      {displayName(c.profile, c.user_id)}
                    </span>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)', marginLeft:6, fontFamily:'var(--font-body)' }}>
                      {timeAgo(c.created_at)}
                    </span>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontFamily:'var(--font-body)', marginTop:3, lineHeight:'1.5' }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Comment input */}
          <div className="flex gap-2 items-center">
            <div style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center' }}>
              <input
                value={commentInput}
                onChange={e => onCommentInput(e.target.value.slice(0, 500))}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onCommentSubmit(post.id) } }}
                placeholder="Write a comment…"
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'#fff', fontSize:12, fontFamily:'var(--font-body)' }}
              />
            </div>
            <button
              onClick={() => onCommentSubmit(post.id)}
              disabled={!commentInput.trim() || submittingComment}
              style={{
                width:34, height:34, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: commentInput.trim() ? 'linear-gradient(135deg,#7B6CF5,#5C4ED4)' : 'rgba(255,255,255,0.06)',
                border:'none', cursor: commentInput.trim() ? 'pointer' : 'default',
                color:'#fff', opacity: submittingComment ? 0.5 : 1,
              }}
            >
              {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon, label, onClick, active }: {
  icon: React.ReactNode; label: string; onClick: () => void; active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5"
      style={{
        background: active ? 'rgba(108,93,211,0.12)' : 'none',
        border: `1px solid ${active ? 'rgba(108,93,211,0.22)' : 'transparent'}`,
        borderRadius:10, padding:'6px 10px', cursor:'pointer',
        color: active ? '#a78bfa' : 'rgba(255,255,255,0.32)',
        fontSize:11, fontFamily:'var(--font-display)', fontWeight:600,
        transition:'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background='none' }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const supabase = createClient()

  // Profile
  const [myProfile, setMyProfile]     = useState<(CommunityProfile & { user_id: string }) | null>(null)
  const [myPostCount, setMyPostCount] = useState(0)
  const [myId, setMyId]               = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editName, setEditName]       = useState('')
  const [editBio, setEditBio]         = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef                = useRef<HTMLInputElement>(null)

  // Feed
  const [posts, setPosts]             = useState<EnrichedPost[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [live, setLive]               = useState(false)
  const channelRef                    = useRef<RealtimeChannel | null>(null)

  // Compose
  const [composing, setComposing]     = useState(false)
  const [composeContent, setComposeContent] = useState('')
  const [composeType, setComposeType] = useState<PostType>('general')
  const [composeImage, setComposeImage] = useState<File | null>(null)
  const [composePreview, setComposePreview] = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const imageInputRef                 = useRef<HTMLInputElement>(null)

  // Sidebar
  const [trending, setTrending]       = useState<TrendingTag[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [profileSearch, setProfileSearch] = useState('')

  // Comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setMyId(data.user.id)
      const res = await fetch('/api/community/profile')
      const json = await res.json()
      setMyProfile(json.profile ? { ...json.profile, user_id: data.user.id } : { user_id: data.user.id, display_name: null, avatar_url: null })
      setMyPostCount(json.post_count ?? 0)
    })
    fetch('/api/community/trending').then(r => r.json()).then(j => setTrending(j.trending ?? []))
    fetch('/api/community/leaderboard').then(r => r.json()).then(j => setLeaderboard(j.leaderboard ?? []))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Posts ─────────────────────────────────────────────────────────────────
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

  // Realtime
  useEffect(() => {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
    const ch = supabase.channel('community_v5')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        const p = payload.new as EnrichedPost
        if (filter !== 'all' && p.post_type !== filter) return
        setPosts(prev => prev.some(x => x.id === p.id) ? prev : [{ ...p, liked_by_me:false, bookmarked_by_me:false, reactions:{}, my_reaction:null, profile:null }, ...prev])
      })
      .subscribe(s => setLive(s === 'SUBSCRIBED'))
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Interactions ──────────────────────────────────────────────────────────
  const handleLike = async (id: string, liked: boolean) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked_by_me: !liked, like_count: liked ? p.like_count - 1 : p.like_count + 1 } : p))
    await fetch(`/api/community/posts/${id}/like`, { method: liked ? 'DELETE' : 'POST' })
  }

  const handleBookmark = async (id: string, bookmarked: boolean) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked_by_me: !bookmarked, bookmark_count: bookmarked ? p.bookmark_count - 1 : p.bookmark_count + 1 } : p))
    await fetch(`/api/community/posts/${id}/bookmark`, { method: bookmarked ? 'DELETE' : 'POST' })
  }

  const handleReact = async (id: string, emoji: string, current: string | null) => {
    const removing = current === emoji
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p
      const next = { ...p.reactions }
      if (current && next[current]) { next[current]--; if (!next[current]) delete next[current] }
      if (!removing) next[emoji] = (next[emoji] ?? 0) + 1
      return { ...p, reactions: next, my_reaction: removing ? null : emoji }
    }))
    if (removing) {
      await fetch(`/api/community/posts/${id}/reactions`, { method: 'DELETE' })
    } else {
      await fetch(`/api/community/posts/${id}/reactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }) })
    }
  }

  const toggleComments = async (postId: string) => {
    const next = new Set(expandedComments)
    if (next.has(postId)) { next.delete(postId); setExpandedComments(next); return }
    next.add(postId)
    setExpandedComments(next)
    if (!postComments[postId]) {
      const json = await fetch(`/api/community/posts/${postId}/comments`).then(r => r.json())
      setPostComments(prev => ({ ...prev, [postId]: json.comments ?? [] }))
    }
  }

  const submitComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content || submittingComment) return
    setSubmittingComment(postId)
    try {
      const res  = await fetch(`/api/community/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      const json = await res.json()
      if (json.comment) {
        setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), json.comment] }))
        setCommentInputs(prev => ({ ...prev, [postId]: '' }))
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
      }
    } finally { setSubmittingComment(null) }
  }

  // ── Submit post ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!composeContent.trim() || submitting) return
    setSubmitting(true)
    try {
      let imageUrl: string | null = null
      if (composeImage) {
        const fd = new FormData(); fd.append('file', composeImage); fd.append('kind', 'post')
        const up = await fetch('/api/community/upload', { method: 'POST', body: fd }).then(r => r.json())
        imageUrl = up.url ?? null
      }
      const res  = await fetch('/api/community/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: composeContent.trim(), post_type: composeType, image_url: imageUrl }) })
      const json = await res.json()
      if (json.post) {
        setPosts(prev => prev.some(p => p.id === json.post.id) ? prev : [json.post, ...prev])
        setMyPostCount(c => c + 1)
      }
      setComposeContent(''); setComposeType('general'); setComposeImage(null); setComposePreview(null); setComposing(false)
    } finally { setSubmitting(false) }
  }

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setAvatarUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('kind', 'avatar')
      const up = await fetch('/api/community/upload', { method: 'POST', body: fd }).then(r => r.json())
      if (up.url) {
        await fetch('/api/community/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_url: up.url }) })
        setMyProfile(prev => prev ? { ...prev, avatar_url: up.url } : prev)
      }
    } finally { setAvatarUploading(false) }
  }

  // ── Save profile ───────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const res  = await fetch('/api/community/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ display_name: editName, bio: editBio }) })
      const json = await res.json()
      if (json.profile) setMyProfile(prev => ({ ...prev!, ...json.profile }))
      setEditingProfile(false)
    } finally { setSavingProfile(false) }
  }

  // ── Compose image pick ─────────────────────────────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setComposeImage(file)
    setComposePreview(URL.createObjectURL(file))
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'relative', minHeight:'100vh', background:'linear-gradient(135deg,#12103a 0%,#1a1260 35%,#16104e 60%,#0f0c38 100%)', overflow:'hidden' }}>
      <Swooshes/>

      <div className="relative flex gap-0" style={{ zIndex:1, minHeight:'100vh', padding:'28px 24px 40px' }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <div style={{ width:190, flexShrink:0, marginRight:24 }}>

          {/* Avatar */}
          <div style={{ position:'relative', width:88, height:88, marginBottom:10 }}>
            <Avatar profile={myProfile} userId={myId ?? ''} size={88}/>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border:'2px solid #12103a', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
            >
              {avatarUploading ? <Loader2 className="w-3 h-3 animate-spin text-white"/> : <Camera className="w-3 h-3 text-white"/>}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
          </div>

          {/* Name + edit */}
          {editingProfile ? (
            <div className="flex flex-col gap-2 mb-4">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value.slice(0,30))}
                placeholder="Display name"
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(108,93,211,0.3)', borderRadius:8, padding:'6px 10px', color:'#fff', fontSize:12, fontFamily:'var(--font-display)', outline:'none', width:'100%' }}
              />
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value.slice(0,150))}
                placeholder="Bio (150 chars)"
                rows={2}
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(108,93,211,0.3)', borderRadius:8, padding:'6px 10px', color:'rgba(255,255,255,0.7)', fontSize:11, fontFamily:'var(--font-body)', outline:'none', width:'100%', resize:'none' }}
              />
              <div className="flex gap-1.5">
                <button onClick={saveProfile} disabled={savingProfile} style={{ flex:1, background:'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border:'none', borderRadius:8, padding:'6px', color:'#fff', fontSize:11, fontFamily:'var(--font-display)', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                  {savingProfile ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>} Save
                </button>
                <button onClick={() => setEditingProfile(false)} style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px', color:'rgba(255,255,255,0.4)', fontSize:11, fontFamily:'var(--font-display)', cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'#fff' }}>
                  {displayName(myProfile, myId ?? '')}
                </p>
                <button onClick={() => { setEditName(myProfile?.display_name ?? ''); setEditBio(myProfile?.bio ?? ''); setEditingProfile(true) }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', padding:2 }}>
                  <Pencil className="w-3 h-3"/>
                </button>
              </div>
              {myProfile?.bio && <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontFamily:'var(--font-body)', lineHeight:'1.4' }}>{myProfile.bio}</p>}
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:'var(--font-display)', marginTop:4 }}>{myPostCount} post{myPostCount !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Live */}
          {live && (
            <div className="flex items-center gap-1.5 mb-4">
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399', display:'inline-block' }}/>
              <span style={{ fontSize:10, color:'#34d399', fontFamily:'var(--font-display)', fontWeight:600 }}>Live</span>
            </div>
          )}

          {/* Filter pills */}
          <div className="flex flex-col gap-2">
            {TYPE_FILTERS.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} style={{ background: filter===tab.key ? 'rgba(108,93,211,0.25)' : 'rgba(255,255,255,0.07)', border: filter===tab.key ? '1px solid rgba(108,93,211,0.4)' : '1px solid rgba(255,255,255,0.09)', borderRadius:999, padding:'8px 16px', color: filter===tab.key ? '#c4b8ff' : 'rgba(255,255,255,0.55)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:12, cursor:'pointer', textAlign:'left', width:'100%' }}>
                {tab.label}
              </button>
            ))}
          </div>

          <button onClick={() => setComposing(true)} style={{ marginTop:20, background:'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border:'none', borderRadius:999, padding:'10px 0', color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, cursor:'pointer', width:'100%', boxShadow:'0 0 20px rgba(108,93,211,0.35)' }}>
            + New Post
          </button>
        </div>

        {/* ── CENTER FEED ───────────────────────────────────────────────────── */}
        <div style={{ flex:1, minWidth:0, marginRight:20 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:26, color:'#fff', letterSpacing:'-0.02em', marginBottom:10 }}>
            Community Kove
          </h1>
          <div style={{ height:1, background:'rgba(255,255,255,0.12)', marginBottom:20 }}/>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color:'#7B6CF5' }}/>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color:'rgba(255,255,255,0.22)', fontFamily:'var(--font-display)', fontSize:14 }}>No posts yet — be the first</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                myId={myId}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onReact={handleReact}
                commentsOpen={expandedComments.has(post.id)}
                onToggleComments={() => toggleComments(post.id)}
                comments={postComments[post.id] ?? []}
                commentInput={commentInputs[post.id] ?? ''}
                onCommentInput={v => setCommentInputs(prev => ({ ...prev, [post.id]: v }))}
                onCommentSubmit={submitComment}
                submittingComment={submittingComment === post.id}
              />
            ))
          )}
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={{ width:210, flexShrink:0 }}>

          {/* Search profiles */}
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Search className="w-3.5 h-3.5" style={{ color:'rgba(255,255,255,0.3)', flexShrink:0 }}/>
            <input
              value={profileSearch}
              onChange={e => setProfileSearch(e.target.value)}
              placeholder="Search traders…"
              style={{ background:'none', border:'none', outline:'none', color:'#fff', fontSize:12, fontFamily:'var(--font-body)', width:'100%' }}
            />
          </div>

          {/* Trending */}
          <div style={{ background:'rgba(20,15,65,0.8)', border:'1px solid rgba(108,93,211,0.2)', borderRadius:18, padding:'16px 16px 14px', marginBottom:14, backdropFilter:'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-3.5 h-3.5" style={{ color:'#8B7CF8' }}/>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'#fff' }}>Trending</h3>
            </div>
            {trending.length === 0 ? (
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.22)', fontFamily:'var(--font-body)' }}>Post something to see trends</p>
            ) : (
              <div className="flex flex-col gap-2">
                {trending.map((t, i) => (
                  <div key={t.tag} className="flex items-center justify-between">
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'#8B7CF8' }}>{t.tag}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:10, color:'rgba(255,255,255,0.28)' }}>{t.count} post{t.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div style={{ background:'rgba(20,15,65,0.8)', border:'1px solid rgba(108,93,211,0.2)', borderRadius:18, padding:'16px 16px 14px', backdropFilter:'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-3.5 h-3.5" style={{ color:'#fbbf24' }}/>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'#fff' }}>Leaderboard</h3>
            </div>
            {leaderboard.length === 0 ? (
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.22)', fontFamily:'var(--font-body)' }}>No activity yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {leaderboard.map(entry => (
                  <div key={entry.user_id} className="flex items-center gap-2">
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:11, width:14, textAlign:'center', color: entry.rank===1?'#fbbf24':entry.rank===2?'#94a3b8':entry.rank===3?'#cd7f32':'rgba(255,255,255,0.22)' }}>
                      {entry.rank}
                    </span>
                    <Avatar profile={entry.profile} userId={entry.user_id} size={26}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:11, color:'rgba(255,255,255,0.75)', lineHeight:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {displayName(entry.profile, entry.user_id)}
                      </p>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:9, color:'rgba(255,255,255,0.28)', marginTop:2 }}>
                        {entry.posts}p · {entry.likes}♥
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Compose modal ─────────────────────────────────────────────────────── */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setComposing(false) }}>
          <div style={{ width:'100%', maxWidth:520, background:'#0d0b28', border:'1px solid rgba(108,93,211,0.3)', borderRadius:22, padding:28, boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color:'#fff' }}>New Post</h2>
              <button onClick={() => { setComposing(false); setComposeImage(null); setComposePreview(null) }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)' }}>
                <X className="w-4 h-4"/>
              </button>
            </div>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.entries(TYPE_CFG) as [PostType, typeof TYPE_CFG[PostType]][]).map(([t, c]) => (
                <button key={t} onClick={() => setComposeType(t)} style={{ background: composeType===t ? c.bg : 'rgba(255,255,255,0.04)', border:`1px solid ${composeType===t ? c.border : 'rgba(255,255,255,0.08)'}`, borderRadius:999, padding:'5px 13px', color: composeType===t ? c.color : 'rgba(255,255,255,0.3)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                  {c.label}
                </button>
              ))}
            </div>

            <textarea
              value={composeContent}
              onChange={e => setComposeContent(e.target.value.slice(0,1000))}
              placeholder="Share your setup, win, loss, or market reaction… Use $XAUUSD to tag instruments."
              rows={5}
              style={{ width:'100%', resize:'none', outline:'none', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'13px 15px', color:'#fff', fontFamily:'var(--font-body)', fontSize:14, lineHeight:'1.6' }}
              autoFocus
            />

            {/* Image preview */}
            {composePreview && (
              <div style={{ position:'relative', marginTop:10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={composePreview} alt="Preview" style={{ width:'100%', borderRadius:12, maxHeight:200, objectFit:'cover' }}/>
                <button onClick={() => { setComposeImage(null); setComposePreview(null) }}
                  style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
                  <X className="w-3 h-3"/>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button onClick={() => imageInputRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, padding:'6px 12px', color:'rgba(255,255,255,0.45)', fontSize:12, fontFamily:'var(--font-display)', cursor:'pointer' }}>
                  <ImageIcon className="w-3.5 h-3.5"/> Image
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick}/>
                <span style={{ fontSize:10, color: composeContent.length > 900 ? '#f87171' : 'rgba(255,255,255,0.2)', fontFamily:'var(--font-body)' }}>
                  {composeContent.length}/1000
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!composeContent.trim() || submitting}
                className="flex items-center gap-2"
                style={{ background:'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border:'none', borderRadius:12, padding:'10px 22px', color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, cursor: !composeContent.trim()||submitting ? 'not-allowed' : 'pointer', opacity: !composeContent.trim()||submitting ? 0.5 : 1, boxShadow:'0 0 20px rgba(108,93,211,0.35)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
