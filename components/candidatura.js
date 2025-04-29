import { useState } from 'react';
import "../src/styles/eventos-candidatura.css";

const Candidatura = () => {
  const [showModal, setShowModal] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itemsPorPagina = 3;

  // Exemplo de eventos (substituir com seus dados reais)
  const eventos = [
    { id: 1, titulo: 'Representante de Sala' },
    { id: 2, titulo: 'Vice Representante de Sala' },
    { id: 3, titulo: 'Comissão de Eventos' },
    { id: 4, titulo: 'Monitoria Acadêmica' },
    { id: 5, titulo: 'Voluntariado Escolar' },
    { id: 6, titulo: 'Grupo de Estudo' },
  ];

  const totalPages = Math.ceil(eventos.length / itemsPorPagina);
  const indexInicial = (paginaAtual - 1) * itemsPorPagina;
  const eventosPagina = eventos.slice(indexInicial, indexInicial + itemsPorPagina);

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
  };

  return (
    <>
      <div className="divider-verde"></div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5 className='title'>Eventos disponíveis para candidatura</h5>
            <div className="box-eventos">
              {eventosPagina.map((evento) => (
                <div className="evento" key={evento.id}>
                  <p className='cargo'>{evento.titulo}</p>
                  <div className="inscreva">
                    <a href="/homeLogado">Inscreva-se</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            <div className="pagination">
              {paginaAtual > 1 && (
                <button className="anterior" onClick={() => irParaPagina(paginaAtual - 1)}>
                  {paginaAtual - 1}
                </button>
              )}
              <span className="atual">{paginaAtual}</span>
              {paginaAtual < totalPages && (
                <button className="prox" onClick={() => irParaPagina(paginaAtual + 1)}>
                  {paginaAtual + 1}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="container-fluid cont-branco"></div>
    </>
  );
};

export default Candidatura;
