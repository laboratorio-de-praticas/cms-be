import React, { useState } from 'react';
import { useRouter } from 'next/router';
import "../styles/formVisitante.css";

const FormVisitante = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    try {
      const resposta = await fetch('/api/Visitantes/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, telefone }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem('Visitante cadastrado com sucesso!');
        // Redireciona após 1.5s para dar tempo de mostrar a mensagem
        setTimeout(() => {
          router.push('/homeLogado');
        }, 1500);
      } else {
        setMensagem(dados.erro || 'Erro ao cadastrar visitante');
      }

    } catch (erro) {
      console.error('Erro ao enviar dados:', erro);
      setMensagem('Erro inesperado ao cadastrar visitante.');
    }
  };

  const handleRedirect = () => {
    router.push('/homeLogado');
  };

  return (
    <div className="container-md container-visitante">
      <div className="title-visitante">
        <p>Tela de</p>
        <h3>Cadastro de visitantes</h3>
      </div>

      <form className="form-visitante" onSubmit={handleSubmit}>
        <div className="row">
          <input
            type="text"
            className="inp-usu"
            placeholder="Nome:"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="row">
          <input
            type="tel"
            className="inp-celular"
            placeholder="Celular: (**)*****-****"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>

        <div className="row">
          <button type="submit" className="cadastrar">Cadastrar</button>
          <button type="button" className="voltar" onClick={handleRedirect}>Voltar</button>
        </div>

        {mensagem && (
          <div className="mensagem">
            {mensagem}
          </div>
        )}
      </form>
    </div>
  );
}

export default FormVisitante;
