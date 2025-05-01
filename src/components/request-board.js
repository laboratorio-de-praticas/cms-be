import { useEffect, useState } from 'react';
import '../styles/request-board.css';

const RequestBoard = () => {
  const [alunos, setAlunos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHistorico, setIsHistorico] = useState(false);
  const [visibilidadeSemestres, setVisibilidadeSemestres] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;

  // Carregar dados dos alunos
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetch('/api/Alunos/Get_all', { cache: 'no-store' });
        if (!response.ok) throw new Error('Erro ao buscar alunos');
        const data = await response.json();
        if (data.dados) {
          console.log('Dados recebidos:', data.dados); // Verifique o que está vindo da API
          setAlunos(data.dados);

          const semestresUnicos = [...new Set(data.dados.map((a) => a.curso_semestre))];
          const estadoInicial = {};
          semestresUnicos.forEach((sem) => {
            estadoInicial[sem] = true; // Começa visível
          });
          setVisibilidadeSemestres(estadoInicial);
        }
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlunos();
  }, []);

  const toggleHistorico = () => setIsHistorico(!isHistorico);

  const toggleVisibilidade = (semestre) => {
    setVisibilidadeSemestres((prev) => ({
      ...prev,
      [semestre]: !prev[semestre],
    }));
  };

  const ocultarOuExibirTodos = () => {
    const todosVisiveis = Object.values(visibilidadeSemestres).every((v) => v === true);
    const novoEstado = {};
    Object.keys(visibilidadeSemestres).forEach((sem) => {
      novoEstado[sem] = !todosVisiveis;
    });
    setVisibilidadeSemestres(novoEstado);
  };

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
      alert('Erro ao realizar ação no representante');
    }
  };

  // Filtragem de alunos para o histórico (só mostra os "Aceitos")
  const historico = alunos.filter((aluno) => aluno.status === 'Aceito');
  const totalPages = Math.ceil(historico.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = historico.slice(indexOfFirstCard, indexOfLastCard);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar os alunos: {error}</div>;

  // Agrupar alunos por curso_semestre
  const grupos = alunos.reduce((acc, aluno) => {
    const chave = aluno.curso_semestre || 'Sem turma';
    if (!acc[chave]) acc[chave] = [];
    if (aluno.status !== 'Aceito') acc[chave].push(aluno);
    return acc;
  }, {});

  return (
    <div className="request-board">
      <div className="header-board">
        <p className="titulo-pedidos">Pedidos</p>
        <div className="linha-topo">
          <h2 className="titulo-h2">Aspirantes a Candidato</h2>
          <div className="acoes-direita">
            <a href="#" onClick={ocultarOuExibirTodos}>
              {Object.values(visibilidadeSemestres).every((v) => v) ? 'Ocultar todos' : 'Exibir todos'}
            </a>
            <span className="request-board-divider">|</span>
            <a href="#" onClick={toggleHistorico}>
              {isHistorico ? 'Atuais' : 'Histórico'}
            </a>
          </div>
        </div>
        <div className="divider-title-board"></div>
      </div>

      {/* Se não for Histórico, mostra os Aspirantes */}
      {!isHistorico && (
        <div className="body-board">
          {Object.entries(grupos).map(([semestre, alunosDoSemestre]) => (
            <div key={semestre} className="turma">
              <div className="titulo-turma">
                <p>{semestre}</p>
                <a href="#" className="seta-turma" onClick={() => toggleVisibilidade(semestre)}>
                  <img
                    src={
                      visibilidadeSemestres[semestre]
                        ? '/imgs/arrow-student-card.svg'
                        : '/imgs/arrow-down-student.svg'
                    }
                    width={15}
                    height={15}
                    alt="Toggle"
                  />
                </a>
              </div>
              <div className="turma-divider"></div>

              {visibilidadeSemestres[semestre] &&
                alunosDoSemestre.map((aluno) => (
                  <div key={aluno.id_aluno} className="card-request">
                    <img
                      src={aluno.foto_url || '/imgs/foto-perfil.png'}
                      width={70}
                      height={70}
                      alt={aluno.nome_usuario}
                    />
                    <div className="data-request">
                      <p className="nome-candidato-request">{aluno.nome_usuario || 'Sem Nome'}</p>
                      <p className="turma-candidato-request">{aluno.curso_semestre || 'Sem Turma'}</p>
                    </div>
                    <div className="actions-card-request">
                      <button
                        className="aceitar"
                        onClick={() =>
                          handleRepresentanteAction(aluno.id_aluno, aluno.fk_id_evento, 'Ativo')
                        }
                      >
                        Aceitar
                      </button>
                      <button
                        className="recusar"
                        onClick={() =>
                          handleRepresentanteAction(aluno.id_aluno, aluno.fk_id_evento, 'Desligado')
                        }
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Se for Histórico, exibe os aceitos */}
      {isHistorico && (
        <div className="body-historic">
          {currentCards.length === 0 ? (
            <p>Nenhum aluno aceito no histórico.</p>
          ) : (
            currentCards.map((aluno, index) => (
              <div key={index} className="card-request">
                <img src={aluno.foto_url || '/imgs/foto-perfil.png'} width={70} height={70} alt="" />
                <div className="data-request">
                  <p className="nome-candidato-request">{aluno.nome_usuario}</p>
                  <p className="turma-candidato-request">{aluno.curso_semestre}</p>
                </div>
                <div className="actions-card-historic">
                  <button className="aceito">Aceito</button>
                  <button className="revisar">Revisar</button>
                </div>
              </div>
            ))
          )}

          {/* Paginação */}
          {totalPages > 1 && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default RequestBoard;
