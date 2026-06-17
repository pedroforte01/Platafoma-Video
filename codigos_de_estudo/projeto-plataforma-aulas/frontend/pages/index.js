import { useEffect, useState } from 'react';

export default function Home() {
    const [videos, setVideos] = useState([]);
    async function carregarVideos() {
        const resposta = await fetch('http://localhost:3334/videos');
        const dados = await resposta.json();
        setVideos(dados);
    }

    useEffect(() => {
        carregarVideos();
    }, []);

    return (
        <div>
            <h1>Bem-vindo à Plataforma de Aulas Online!</h1>
            <p>Explore nossos vídeos e aprenda algo novo hoje mesmo.</p>
            <hr />
            <ul>
                {videos.map((video) => (
                    <li key={video.id}>
                        <h2>{video.title}</h2>
                        <p>{video.description}</p>
                        <p>Duração: {video.duration} minutos</p>
                    </li>
                ))}
            </ul>
            <hr />
            <Caixa /> 
            <Button />
        </div>
    )
}

function Caixa() {
return (
    <h1>Caixa de teste H1 </h1> 
)}

export function Button() {
    const [buttoncounter, setButtonCounter] = useState(0);

    return (
        <button onClick={() => setButtonCounter(buttoncounter + 1)}>
            Botão de teste ({buttoncounter})
        </button>
    )
}

