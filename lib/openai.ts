import OpenAI from 'openai'

// Lazy initialization — only created when first used at runtime,
// never at build time, so missing key won't break the build.
let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}
