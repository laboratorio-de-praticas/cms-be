import { useState, useEffect } from 'react';
import '../styles/request-board.css';

const RequestBoard = () => {
  const [alunos, setAlunos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHistorico, setIsHistorico] = useState(false);
  const [isBodyVisible, setIsBodyVisible] = useState(true);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;

  // Paginação
  const totalPages = Math.ceil(alunos.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = alunos.slice(indexOfFirstCard, indexOfLastCard);

  // Alternar entre histórico e atuais
  const toggleHistorico = () => {
    setIsHistorico(!isHistorico);
    setIsBodyVisible(!isBodyVisible);
  };

  const toggleCardVisibility = () => setIsCardVisible(!isCardVisible);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Carregar dados
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetch('/api/Alunos/Get_all', { cache: 'no-store' });
        if (!response.ok) throw new Error('Erro ao buscar alunos');
        const data = await response.json();
        if (data.dados) setAlunos(data.dados);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar alunos:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlunos();
  }, []);

  // Aceitar ou recusar
  const handleRepresentanteAction = async (idAluno, fkIdEvento, acao) => {
    try {
      const response = await fetch('/api/Alunos/Create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao, id_aluno: idAluno, fk_id_evento: fkIdEvento }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Representante ${acao === 'Ativo' ? 'aceito' : 'recusado'} com sucesso!`);
      } else {
        alert(`Erro ao ${acao === 'Ativo' ? 'aceitar' : 'recusar'} representante: ${data.mensagem}`);
      }
    } catch (err) {
      console.error('Erro ao atualizar representante:', err);
      alert('Erro ao realizar ação no representante');
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar os alunos: {error}</div>;

  return (
    <div className="request-board">
      <div className="header-board">
        <p className="titulo-pedidos">Pedidos</p>
        <div className="linha-topo">
          <h2 className="titulo-h2">Aspirantes a Candidato</h2>
          <div className="acoes-direita">
            <a href="#">Ocultar Todos</a>
            <span className="request-board-divider">|</span>
            <a href="#" onClick={toggleHistorico}>
              {isHistorico ? 'Histórico' : 'Atuais'}
            </a>
          </div>
        </div>
        <div className="divider-title-board"></div>
      </div>

      {/* Aspirantes visíveis */}
      {isBodyVisible && (
        <div className="body-board">
          <div className="turma">
            <div className="titulo-turma">
              <p>DSM 6</p>
              <a href="#" className="seta-turma" onClick={toggleCardVisibility}>
                <img
                  src={isCardVisible ? '/imgs/arrow-student-card.svg' : '/imgs/arrow-down-student.svg'}
                  width={15}
                  height={15}
                  alt="Toggle visibility"
                />
              </a>
            </div>
            <div className="turma-divider"></div>

            {isCardVisible &&
              alunos.map((aluno) => (
                <div key={aluno.id_aluno} className="card-request">
                  <img src={aluno.foto_url || '/imgs/foto-perfil.png'} width={70} height={70} alt={aluno.nome_usuario} />
                  <div className="data-request">
                    <p className="nome-candidato-request">{aluno.nome_usuario || 'Sem Nome'}</p>
                    <p className="turma-candidato-request">{aluno.curso_semestre || 'Sem Turma'}</p>
                  </div>
                  <div className="actions-card-request">
                    <button className="aceitar" onClick={() => handleRepresentanteAction(aluno.id_aluno, aluno.fk_id_evento, 'Ativo')}>Aceitar</button>
                    <button className="recusar" onClick={() => handleRepresentanteAction(aluno.id_aluno, aluno.fk_id_evento, 'Desligado')}>Recusar</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Histórico visível */}
      {isHistorico && (
        <div className="body-historic">
          {currentCards.map((card, index) => (
            <div key={index} className="card-request">
              <img src={card.foto_url || '/imgs/foto-perfil.png'} width={70} height={70} alt="" />
              <div className="data-request">
                <p className="nome-candidato-request">{card.nome_usuario}</p>
                <p className="turma-candidato-request">{card.curso_semestre}</p>
              </div>
              <div className="actions-card-historic">
                <button className="aceito">Aceito</button>
                <button className="revisar">Revisar</button>
              </div>
            </div>
          ))}

          {/* Paginação */}
          <div className="pagination">
            {currentPage > 1 && (
              <button className="anterior" onClick={() => paginate(currentPage - 1)}>
                {currentPage - 1}
              </button>
            )}
            <span className="atual">{currentPage}</span>
            {currentPage < totalPages && (
              <button className="prox" onClick={() => paginate(currentPage + 1)}>
                {currentPage + 1}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestBoard;
