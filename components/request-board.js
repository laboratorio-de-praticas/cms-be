import { useState } from 'react';
import '../src/styles/request-board.css';

const RequestBoard = () => {
    // visibilidade do card-request
    const [isCardVisible, setIsCardVisible] = useState(true);

    // visibilidade do body-board
    const [isBodyVisible, setIsBodyVisible] = useState(true);

    // visibilidade do body-historic
    const [isHistoricVisible, setIsHistoricVisible] = useState(false);

    // link histórico para atuais
    const [isHistorico, setIsHistorico] = useState(true);

    // Estado da paginação para o body-historic
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 3;

    // Exemplo de dados para os cards no histórico
    const historicData = [
        { name: 'Guilherme Marcos da Silva', turma: 'DSM 6' },
        { name: 'Ana Souza', turma: 'DSM 7' },
        { name: 'Carlos Silva', turma: 'DSM 8' },
        { name: 'Paula Costa', turma: 'DSM 9' },
        { name: 'Juliana Pereira', turma: 'DSM 10' },
        { name: 'Lucas Oliveira', turma: 'DSM 11' },
        { name: 'Mariana Ferreira', turma: 'DSM 12' },
        { name: 'Ricardo Lima', turma: 'DSM 13' },
    ];

    // Calcula os índices dos cards a serem exibidos
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = historicData.slice(indexOfFirstCard, indexOfLastCard);

    // Função para mudar de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculando o total de páginas
    const totalPages = Math.ceil(historicData.length / cardsPerPage);

    // visibilidade do card-request
    const toggleCardVisibility = () => {
        setIsCardVisible(!isCardVisible);
    };

    // visibilidade do body-board, link e body-historic
    const toggleHistorico = () => {
        setIsBodyVisible(!isBodyVisible);
        setIsHistorico(!isHistorico);
        setIsHistoricVisible(!isHistoricVisible);
    };

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

            {/* visibilidade body-board */}
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

                        {/* visibilidade card-request */}
                        {isCardVisible && (
                            <div className="card-request">
                                <img src="/imgs/foto-perfil.png" width={70} height={70} alt="" />
                                <div className="data-request">
                                    <p className="nome-candidato-request">Guilherme Marcos da Silva</p>
                                    <p className="turma-candidato-request">DSM 6</p>
                                </div>
                                <div className="actions-card-request">
                                    <button className="aceitar">Aceitar</button>
                                    <button className="recusar">Recusar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* visibilidade body-historic */}
            {isHistoricVisible && (
                <div className="body-historic">
                    {currentCards.map((card, index) => (
                        <div key={index} className="card-request">
                            <img src="/imgs/foto-perfil.png" width={70} height={70} alt="" />
                            <div className="data-request">
                                <p className="nome-candidato-request">{card.name}</p>
                                <p className="turma-candidato-request">{card.turma}</p>
                            </div>
                            <div className="actions-card-historic">
                                <button className="aceito">Aceito</button>
                                <button className="revisar">Revisar</button>
                            </div>
                        </div>
                    ))}

                    {/* Paginação */}
                    <div className="pagination">
                        {/* Botão para a página anterior */}
                        {currentPage > 1 && (
                            <button
                                className="anterior"
                                onClick={() => paginate(currentPage - 1)}
                            >
                                {currentPage - 1}
                            </button>
                        )}

                        {/* Página atual */}
                        <span className="atual">{currentPage}</span>

                        {/* Botão para a próxima página */}
                        {currentPage < totalPages && (
                            <button
                                className="prox"
                                onClick={() => paginate(currentPage + 1)}
                            >
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
