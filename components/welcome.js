import { useState, useEffect } from 'react';  // Adicione essa importação
import "../src/styles/welcome.css";

const Welcome = () => {
    const [isClient, setIsClient] = useState(false); // Inicializando o estado

    useEffect(() => {
        setIsClient(true);  // Garantir que o código só execute no cliente
    }, []);

    if (!isClient) return null;  // Evitar renderização no lado do servidor

    return (
        <div className="bem-vindo-container">
            <div className="row justify-content-center text-start">
                <div className="col-12">
                    <p className="bem-vindo">Bem-vindo ao</p>
                    <h2 className="cms"> CMS - Sistema de Gerenciamento de Conteúdo</h2>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
