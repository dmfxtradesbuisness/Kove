import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { moderateImage } from '@/lib/content-moderation'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file     = formData.get('file') as File | null
    const kind     = (formData.get('kind') as string) ?? 'post' // 'post' | 'avatar'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, GIF, WebP allowed' }, { status: 400 })
    }

    const bucket = kind === 'avatar' ? 'avatars' : 'community-images'
    const maxSize = kind === 'avatar' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${maxSize / 1024 / 1024}MB)` }, { status: 400 })
    }

    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`

    const admin  = createAdminClient()
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(path)

    // ── Image moderation (post images only, not avatars) ─────────────────────
    if (kind !== 'avatar') {
      const imgCheck = await moderateImage(publicUrl)
      if (!imgCheck.ok) {
        // Delete the just-uploaded file before rejecting
        await admin.storage.from(bucket).remove([path])
        return NextResponse.json({ error: imgCheck.reason }, { status: 422 })
      }
    }

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
