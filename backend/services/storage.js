import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export async function uploadVideo(fileBuffer, fileName, mimeType) {
  const safeName = fileName || `video-${Date.now()}.mp4` // fallback se vier undefined

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(safeName, fileBuffer, {
      contentType: mimeType || 'video/mp4',
      upsert: false
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('videos')
    .getPublicUrl(safeName)

  return urlData.publicUrl
}