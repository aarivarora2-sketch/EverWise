import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const ELEVENLABS_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'

function elevenLabsReadAloud(apiKey) {
  return {
    name: 'everwise-elevenlabs-read-aloud',
    configureServer(server) {
      server.middlewares.use('/api/read-aloud', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.end('Method not allowed')
          return
        }

        if (!apiKey) {
          response.statusCode = 503
          response.end('Read-aloud service is not configured')
          return
        }

        try {
          const chunks = []
          for await (const chunk of request) chunks.push(chunk)
          const { text } = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          const cleanText = typeof text === 'string' ? text.trim() : ''

          if (!cleanText || cleanText.length > 5000) {
            response.statusCode = 400
            response.end('Text must be between 1 and 5000 characters')
            return
          }

          const elevenLabsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_22050_32`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
              },
              body: JSON.stringify({
                text: cleanText,
                model_id: 'eleven_flash_v2_5',
                voice_settings: {
                  speed: 0.9,
                  stability: 0.72,
                  similarity_boost: 0.75,
                  style: 0,
                  use_speaker_boost: false,
                },
              }),
            },
          )

          if (!elevenLabsResponse.ok) {
            response.statusCode = elevenLabsResponse.status
            response.end('ElevenLabs could not generate audio')
            return
          }

          response.setHeader('Content-Type', 'audio/mpeg')
          response.setHeader('Cache-Control', 'private, no-store')
          response.end(Buffer.from(await elevenLabsResponse.arrayBuffer()))
        } catch {
          response.statusCode = 500
          response.end('Could not generate read-aloud audio')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), elevenLabsReadAloud(env.ELEVENLABS_API_KEY)],
  }
})
