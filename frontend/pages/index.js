import { useState, useEffect } from 'react'

// Endereço da API Fastify
const API = 'https://platafoma-video-production.up.railway.app'

export default function Home() {
  // ============================================================
  // 1. ESTADOS (MEMÓRIA DO COMPONENTE)
  // ============================================================
  const [videos, setVideos] = useState([])  // Lista de vídeos do banco
  const [form, setForm] = useState({ title: '', description: '', duration: '' }) // Dados do formulário
  const [file, setFile] = useState(null) // Arquivo de vídeo selecionado

  // ============================================================
  // 2. FUNÇÕES DE COMUNICAÇÃO COM O BACKEND (FETCH)
  // ============================================================

  // Busca todos os vídeos do servidor
  async function loadVideos() {
    const res = await fetch(`${API}/videos`)
    const data = await res.json()
    setVideos(Array.isArray(data) ? data : [])
  }

  // Envia o formulário + arquivo de vídeo para o servidor
  async function handleSubmit(e) {
    e.preventDefault() // Impede a página de recarregar

    const formData = new FormData() // FormData permite enviar arquivo + texto juntos
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('duration', form.duration)
    formData.append('file', file) // Anexa o arquivo de vídeo

    await fetch(`${API}/videos`, {
      method: 'POST',
      body: formData // Não precisa de Content-Type, o navegador define automaticamente
    })

    setForm({ title: '', description: '', duration: '' }) // Limpa o formulário
    setFile(null) // Limpa o arquivo selecionado
    loadVideos() // Recarrega a lista
  }

  // Deleta um vídeo usando o ID
  async function handleDelete(id) {
    await fetch(`${API}/videos/${id}`, { method: 'DELETE' })
    loadVideos() // Recarrega a lista após deletar
  }

  // ============================================================
  // 3. EFEITOS (DISPARA ASSIM QUE ABRE A PÁGINA)
  // ============================================================
  useEffect(() => {
    loadVideos()
  }, [])

  // ============================================================
  // 4. RENDERIZAÇÃO (O QUE APARECE NA TELA)
  // ============================================================
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Plataforma de Aulas Online 🚀</h1>

      {/* FORMULÁRIO DE CADASTRO */}
      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>Cadastrar Nova Aula</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexDirection: 'column', maxWidth: '300px' }}>
          <input
            placeholder="Título da Aula"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Descrição"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="Duração (minutos)"
            type="number"
            value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })}
          />
          {/* Input de arquivo — aceita apenas vídeos */}
          <input
            type="file"
            accept="video/*"
            onChange={e => setFile(e.target.files[0])}
            required
          />
          <button type="submit" style={{ backgroundColor: '#0070f3', color: 'white', cursor: 'pointer' }}>
            Salvar Aula
          </button>
        </form>
      </section>

      {/* LISTA DE VÍDEOS DO BANCO NEON */}
      <h3>Aulas Disponíveis</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {videos.map(video => (
          <li key={video.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            
            {/* CABEÇALHO DO VÍDEO COM BOTÃO DE EXCLUIR */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{video.title}</strong>
              <button onClick={() => handleDelete(video.id)} style={{ color: 'red', cursor: 'pointer' }}>
                Excluir
              </button>
            </div>

            {/* DESCRIÇÃO E DURAÇÃO */}
            <p>{video.description} — {video.duration} min</p>

            {/* PLAYER DE VÍDEO — só aparece se tiver URL salva no banco */}
            {video.video_url && (
              <video width="400" controls>
                <source src={video.video_url} type="video/mp4" />
              </video>
            )}

          </li>
        ))}
      </ul>
    </div>
  )
}
