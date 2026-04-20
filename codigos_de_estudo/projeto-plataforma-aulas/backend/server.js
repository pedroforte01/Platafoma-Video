import fastify from 'fastify'
import cors from '@fastify/cors'
import { pool } from './database.js'
import { randomUUID } from 'node:crypto'

const app = fastify()

app.register(cors, {
    origin: '*', 
})

// Criar Vídeo
app.post('/videos', async (request, reply) => {
    const { title, description, duration } = request.body
    const id = randomUUID()

    await pool.query(
        'INSERT INTO videos (id, title, description, duration) VALUES ($1, $2, $3, $4)',
        [id, title, description, duration]
    )

    return reply.status(201).send()
})

// Listar Vídeos (com busca opcional)
app.get('/videos', async (request) => {
    const { search } = request.query 
    
    let result;
    if (search) {
        result = await pool.query('SELECT * FROM videos WHERE title ILIKE $1', [`%${search}%`])
    } else {
        result = await pool.query('SELECT * FROM videos')
    }

    return result.rows
})

// Deletar Vídeo
app.delete('/videos/:id', async (request, reply) => {
    const videoId = request.params.id

    await pool.query('DELETE FROM videos WHERE id = $1', [videoId])

    return reply.status(204).send()
})

app.listen({ 
    host: '0.0.0.0',
    port: 3334 
}).then(() => {
    console.log('🚀 API de Vídeos Online em http://localhost:3334')
})