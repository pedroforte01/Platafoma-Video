import fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { randomUUID } from 'node:crypto'
import 'dotenv/config'
import { pool } from './database.js'
import { uploadVideo } from './services/storage.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const app = fastify()

app.register(cors, {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE']
})

//Limite de upload
app.register(multipart, {
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
})

// LISTAR VÍDEOS
app.get('/videos', async (request) => {
    const { search } = request.query
    let result

    if (search) {
        result = await pool.query(
            'SELECT * FROM videos WHERE title ILIKE $1 ORDER BY created_at DESC',
            [`%${search}%`]
        )
    } else {
        result = await pool.query('SELECT * FROM videos ORDER BY created_at DESC')
    }

    return result.rows
})

// CADASTRAR VÍDEO COM UPLOAD
app.post('/videos', async (request, reply) => {
    try {
        const parts = request.parts()
        const fields = {}
        let fileBuffer, fileName, mimeType

        for await (const part of parts) {
            if (part.file) {
                fileBuffer = await part.toBuffer()
                fileName = `${randomUUID()}-${part.filename}`
                mimeType = part.mimetype
            } else {
                fields[part.fieldname] = part.value
            }
        }

        const videoUrl = await uploadVideo(fileBuffer, fileName, mimeType)
        const id = randomUUID()

        await pool.query(
            'INSERT INTO videos (id, title, description, duration, video_url) VALUES ($1, $2, $3, $4, $5)',
            [id, fields.title, fields.description, fields.duration, videoUrl]
        )

        return reply.status(201).send({ id, videoUrl })
    } catch (err) {
        console.error('ERRO NO UPLOAD:', err)
        return reply.status(500).send({ error: err.message })
    }
})

// DELETAR VÍDEO
app.delete('/videos/:id', async (request, reply) => {
    const videoId = request.params.id

    // Busca a URL do vídeo antes de deletar
    const result = await pool.query('SELECT video_url FROM videos WHERE id = $1', [videoId])
    const video = result.rows[0]

    if (video?.video_url) {
        // Extrai o nome do arquivo da URL
        const fileName = decodeURIComponent(video.video_url.split('/').pop())
        console.log('Deletando arquivo:', fileName)

        // Deleta do Supabase Storage
        const { data, error } = await supabase.storage.from('videos').remove([fileName])
        console.log('Resultado Supabase:', data, error)

    }

    // Deleta do Neon
    await pool.query('DELETE FROM videos WHERE id = $1', [videoId])

    return reply.status(204).send()
})

app.listen({
    host: '0.0.0.0',
    port: 3334
}).then(() => {
    console.log('🚀 API de Vídeos Online em http://localhost:3334')
})

