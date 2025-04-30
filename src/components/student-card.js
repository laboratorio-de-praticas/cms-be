import "../styles/student-card.css";
import React, { useState } from "react";
// comentario para o back-end: eu tentei fazer a paginacao aqui mas nao sei se esta certa
//  porque apesar de esta funcionando,eu nao sei se esta certa, ja q ta repetindo nomes q nao deveriam...
// entao por favr deem uma atencao nessa parte aqui
const StudentCard = () => {
  const students = [
    "Guilherme Marcos da Silva",
    "Jorge Kirimis Leandro",
    "João Massau Marcos",
    "Guilherme de Almeida",
    "Lucas de Almeida",
    "Isabele Queiroz",
    "Ana Carolina",
  ];

  const [formAberto, setFormAberto] = useState({});
  const [detalhesAbertos, setDetalhesAbertos] = useState({});
  const [dados, setDados] = useState(
    students.map((name) => ({
      nome: name,
      semestre: 4,
      celular: "",
      nascimento: "",
      ingresso: "2023",
    }))
  );

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itemsPorPagina = 3;

  const totalPages = Math.ceil(students.length / itemsPorPagina);

  const toggleFormulario = (index) => {
    setFormAberto((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setDetalhesAbertos((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const toggleDetalhes = (index) => {
    setDetalhesAbertos((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setFormAberto((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const handleChange = (index, campo, valor) => {
    const novosDados = [...dados];
    novosDados[index][campo] = valor;
    setDados(novosDados);
  };

  const paginarEstudantes = () => {
    const inicio = (paginaAtual - 1) * itemsPorPagina;
    const fim = inicio + itemsPorPagina;
    return dados.slice(inicio, fim);
  };

  const irParaPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPages) {
      setPaginaAtual(pagina);
    }
  };

  return (
    <div className="student-container-fluid container-students">
      <div className="student-card-wrapper">
        {paginarEstudantes().map((_, index) => (
          <div className="student-row" key={index}>
            <div
              className={`student-card 
                ${formAberto[index] ? "expanded" : ""} 
                ${
                  detalhesAbertos[index] && !formAberto[index]
                    ? "details-open"
                    : ""
                }
              `}
            >
              {/*  EDIÇÃO */}
              {formAberto[index] && (
                <form className="student-form inside-card">
                  <div className="form-avatar">
                    <img src="/imgs/foto-perfil.png" alt="Foto" />
                  </div>
                  <div className="form-fields">
                    <div className="field-group">
                      {/* <div className="form-tags">
                        <div className="btn-group-curso" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name={`options-${index}`}
                            id={`option1-${index}`}
                            autoComplete="off"
                          />
                          <label
                            className="btn btn-amarelo-curso"
                            htmlFor={`option1-${index}`}
                          >
                            DSM
                          </label>
                          <input
                            type="radio"
                            className="btn-check"
                            name={`options-${index}`}
                            id={`option2-${index}`}
                            autoComplete="off"
                          />
                          <label
                            className="btn btn-branco-curso"
                            htmlFor={`option2-${index}`}
                          >
                            GE
                          </label>
                        </div>
                      </div> */}
                      <div className="semestre-container">
                        <label className="semestre-label">
                          Turma Atual:
                        </label>
                        <input
                          className="semestre-input"
                          type="text"
                          value={dados[index].semestre}
                          onChange={(e) =>
                            handleChange(index, "semestre", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="nome-container">
                      <label className="nome-label">Nome:</label>
                      <input
                        className="nome-input"
                        name="nome"
                        type="text"
                        value={dados[index].nome}
                        onChange={(e) =>
                          handleChange(index, "nome", e.target.value)
                        }
                      />
                    </div>

                    <div className="field-group">
                      <div className="celular-container">
                        <label className="celular-label">Celular:</label>
                        <input
                          type="tel"
                          className="celular-input"
                          value={dados[index].celular}
                          onChange={(e) =>
                            handleChange(index, "celular", e.target.value)
                          }
                        />
                      </div>
                      <div className="nascimento-container">
                        <label className="nascimento-label">
                          Data de nascimento:
                        </label>
                        <input
                          className="nascimento-input"
                          value={dados[index].nascimento}
                          onChange={(e) =>
                            handleChange(index, "nascimento", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <div className="ingresso-container">
                        <label className="ingresso-label">
                          Ano de Ingresso:
                        </label>
                        <input
                          className="ingresso-input"
                          value={dados[index].ingresso}
                          onChange={(e) =>
                            handleChange(index, "ingresso", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-actions">
                        <button type="button" className="editar-button">
                          Editar
                        </button>
                        <button
                          type="button"
                          className="cancelar-button"
                          onClick={() => toggleFormulario(index)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* DETALHES */}
              {!formAberto[index] && detalhesAbertos[index] && (
                <div className="student-details-view">
                  <div className="form-avatar">
                    <img src="/imgs/foto-perfil.png" alt="Avatar do aluno" />
                  </div>

                  <div className="student-details">
                    <div className="detail-line">
                      <p className="nome-detalhe">
                        <strong>Nome:</strong> {dados[index].nome}
                      </p>
                    </div>

                    <div className="detail-line cel-nasc-line">
                      <p className="cel-detalhe">
                        <strong>Celular:</strong>{" "}
                        {dados[index].celular || "Não informado"}
                      </p>
                      <p className="nasc-detalhe">
                        <strong>Nascimento:</strong>{" "}
                        {dados[index].nascimento || "Não informado"}
                      </p>
                    </div>

                    <div className="detail-line ingresso-sem-curso">
                      <p className="ingresso-detalhe">
                        <strong>Ingresso:</strong> {dados[index].ingresso}
                      </p>
                      <p className="sem-detalhe">
                        <strong>Turma Atual:</strong> {dados[index].semestre}
                      </p>
                      {/* <div className="btn-group" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name={`options-detalhes-${index}`}
                          id={`option1-detalhes-${index}`}
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-color-curso"
                          htmlFor={`option1-detalhes-${index}`}
                        >
                          DSM
                        </label>
                        <input
                          type="radio"
                          className="btn-check"
                          name={`options-detalhes-${index}`}
                          id={`option2-detalhes-${index}`}
                          autoComplete="off"
                        />
                        <label
                          className="btn btn-branco-detalhes"
                          htmlFor={`option2-detalhes-${index}`}
                        >
                          GE
                        </label>
                      </div> */}
                    </div>
                  </div>

                  <div className="student-actions">
                    <img
                      src={
                        detalhesAbertos[index]
                          ? "/imgs/arrow-down-card.svg"
                          : "/imgs/arrow-student-card.svg"
                      }
                      alt="seta"
                      className="seta-card"
                      onClick={() => toggleDetalhes(index)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              )}

              {/* MODO RESUMIDO */}
              {!formAberto[index] && !detalhesAbertos[index] && (
                <>
                  <div className="student-info">
                    <div className="student-avatar">
                      <img
                        src="/imgs/foto-perfil.png"
                        width={70}
                        height={70}
                        alt="Avatar"
                      />
                    </div>
                    <div>
                      <div className="student-name">{dados[index].nome}</div>
                      <div className="student-class">
                        DSM {dados[index].semestre}
                      </div>
                    </div>
                  </div>
                  <div className="student-actions">
                    <img
                      src="/imgs/arrow-student-card.svg"
                      alt="seta"
                      className="seta-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleDetalhes(index)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="student-buttons">
              {!formAberto[index] && (
                <>
                  <img
                    src="/imgs/edit-student.svg"
                    alt="Editar"
                    className="icon-button"
                    onClick={() => toggleFormulario(index)}
                  />
                  <span>|</span>
                </>
              )}
              <img
                src="/imgs/Delete-student.svg"
                alt="Deletar"
                className="icon-button"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {/* Botão para a página anterior */}
        {paginaAtual > 1 && (
          <button
            className="anterior" // Mudado de 'class' para 'className'
            onClick={() => irParaPagina(paginaAtual - 1)}
          >
            {paginaAtual - 1}
          </button>
        )}

        {/* Página atual */}
        <span className="atual">{paginaAtual}</span>

        {/* Botão para a próxima página */}
        {paginaAtual < totalPages && (
          <button
            className="prox" // Mudado de 'class' para 'className'
            onClick={() => irParaPagina(paginaAtual + 1)}
          >
            {paginaAtual + 1}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentCard;
// autora: Isabele Letícia