import "../styles/student-card.css";
import React, { useState, useEffect } from "react";

const StudentCard = () => {
  const [alunos, setAlunos] = useState([]);
  const [formAberto, setFormAberto] = useState({});
  const [detalhesAbertos, setDetalhesAbertos] = useState({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itemsPorPagina = 3;
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Busca alunos do banco de dados
  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const response = await fetch('/api/Projetos/Get_nome_alunos?nome=%');
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setAlunos(data.map(aluno => ({
            ...aluno,
            editando: false,
            dadosEditados: {
              nome: aluno.nome || '',
              email_institucional: aluno.email_institucional || '',
              curso_semestre: aluno.curso_semestre || '',
              celular: aluno.telefone || '', 
              ra: aluno.ra || '',
              data_matricula: aluno.data_matricula ? 
                aluno.data_matricula.split(' ')[0] : '' 
            }
          })));
        }
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        setErro("Erro ao carregar alunos. Por favor, tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    carregarAlunos();
  }, []);

  const toggleFormulario = (index) => {
    setFormAberto(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
    setDetalhesAbertos(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const toggleDetalhes = (index) => {
    setDetalhesAbertos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
    setFormAberto(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const handleChange = (index, campo, valor) => {
    const novosAlunos = [...alunos];
    novosAlunos[index].dadosEditados[campo] = valor;
    setAlunos(novosAlunos);
  };

  
  const salvarAlteracoes = async (index) => {
    try {
      const aluno = alunos[index];
      
      // Prepara os dados no formato que o backend espera
      const dadosParaEnviar = {
        id_aluno: aluno.id_aluno, // Agora enviando no body
        nome: aluno.dadosEditados.nome,
        email_institucional: aluno.dadosEditados.email_institucional,
        curso_semestre: aluno.dadosEditados.curso_semestre,
        telefone: aluno.dadosEditados.celular,
        ra: aluno.dadosEditados.ra,
        data_matricula: aluno.dadosEditados.data_matricula,
        foto_url: aluno.foto_url || null
      };
  
      const response = await fetch('/api/Alunos/Update', { // Removido o ID da URL
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || `Erro HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Atualiza o estado local
      setAlunos(prev => prev.map((a, i) => 
        i === index ? { 
          ...a,
          ...data.aluno, // Agora usando data.aluno
          dadosEditados: {
            nome: data.aluno.nome,
            email_institucional: data.aluno.email_institucional,
            curso_semestre: data.aluno.curso_semestre,
            celular: data.aluno.telefone,
            ra: data.aluno.ra,
            data_matricula: data.aluno.data_matricula?.split(' ')[0] || ''
          }
        } : a
      ));
  
      setFormAberto(prev => ({ ...prev, [index]: false }));
      setErro(null);
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro(`Falha ao salvar: ${error.message}`);
    }
  };

  
  const deletarAluno = async (idAluno) => {
    try {
      const response = await fetch(`/api/Alunos/Delete/${idAluno}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAlunos(alunos.filter(aluno => aluno.id_aluno !== idAluno));
      } else {
        throw new Error('Erro ao deletar aluno');
      }
    } catch (error) {
      console.error("Erro ao deletar aluno:", error);
      setErro("Erro ao deletar aluno");
    }
  };

  const paginarAlunos = () => {
    const inicio = (paginaAtual - 1) * itemsPorPagina;
    const fim = inicio + itemsPorPagina;
    return alunos.slice(inicio, fim);
  };

  const totalPages = Math.ceil(alunos.length / itemsPorPagina);

  const irParaPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPages) {
      setPaginaAtual(pagina);
    }
  };

  if (carregando) return <div className="loading">Carregando alunos...</div>;
  if (erro) return <div className="error">{erro}</div>;

  return (
    <div className="student-container-fluid container-students">
      <div className="student-card-wrapper">
        {paginarAlunos().map((aluno, index) => (
          <div className="student-row" key={aluno.id_aluno}>
            <div className={`student-card ${formAberto[index] ? "expanded" : ""} ${detalhesAbertos[index] ? "details-open" : ""}`}>
              
              {/* MODO EDIÇÃO */}
              {formAberto[index] && (
                <form className="student-form inside-card" onSubmit={(e) => {
                  e.preventDefault();
                  salvarAlteracoes(index);
                }}>
                  <div className="form-avatar">
                    <img src={aluno.foto_url || "/imgs/foto-perfil.png"} alt="Foto" />
                  </div>
                  <div className="form-fields">
                    <div className="field-group">
                      <div className="semestre-container">
                        <label className="semestre-label">Turma Atual:</label>
                        <input
                          className="semestre-input"
                          type="text"
                          value={aluno.dadosEditados.curso_semestre}
                          onChange={(e) => handleChange(index, 'curso_semestre', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="nome-container">
                      <label className="nome-label">Nome:</label>
                      <input
                        className="nome-input"
                        type="text"
                        value={aluno.dadosEditados.nome}
                        onChange={(e) => handleChange(index, 'nome', e.target.value)}
                      />
                    </div>

                    <div className="nome-container">
                      <label className="nome-label">Email Institucional:</label>
                      <input
                        className="nome-input"
                        type="text"
                        value={aluno.dadosEditados.email_institucional}
                        onChange={(e) => handleChange(index, 'email_institucional', e.target.value)}
                      />
                    </div>

                    <div className="field-group">
                    <div className="celular-container">
                        <label className="celular-label">Celular:</label>
                        <input
                          type="tel"
                          className="celular-input"
                          value={aluno.dadosEditados.celular}
                          onChange={(e) => handleChange(index, 'celular', e.target.value)}
                        />
                      </div>
                      <div className="ra-container">
                        <label className="ra-label">RA:</label>
                        <input
                          className="ra-input"
                          value={aluno.dadosEditados.ra}
                          onChange={(e) => handleChange(index, 'ra', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <div className="matri-container">
                        <label className="matri-label">Data de Matrícula:</label>
                        <input
                          className="matri-input"
                          value={aluno.dadosEditados.data_matricula}
                          onChange={(e) => handleChange(index, 'data_matricula', e.target.value)}
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="editar-button">
                          Salvar
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

              {/* MODO DETALHES */}
              {!formAberto[index] && detalhesAbertos[index] && (
                <div className="student-details-view">
                  <div className="form-avatar">
                    <img src={aluno.foto_url || "/imgs/foto-perfil.png"} alt="Avatar" />
                  </div>

                  <div className="student-details">
                    <div className="detail-line">
                      <p className="nome-detalhe">
                        <strong>Nome:</strong> {aluno.nome || "Não informado"}
                      </p>
                    </div>

                    <div className="detail-line">
                      <p className="nome-detalhe">
                        <strong>Email:</strong> {aluno.email_institucional || "Não informado"}
                      </p>
                    </div>

                    <div className="detail-line cel-nasc-line">
                      <p className="cel-detalhe">
                        <strong>Celular:</strong> {aluno.telefone || "Não informado"}
                      </p>
                      <p className="ra-detalhe">
                        <strong>RA:</strong> {aluno.ra || "Não informado"}
                      </p>
                    </div>

                    <div className="detail-line matri-sem-curso">
                      <p className="matri-detalhe">
                      <strong>Data de Matrícula:</strong> {aluno.data_matricula?.split(' ')[0] || "Não informado"}
                      </p>
                      <p className="sem-detalhe">
                        <strong>Turma Atual:</strong> {aluno.curso_semestre || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="student-actions">
                    <img
                      src="/imgs/arrow-down-card.svg"
                      alt="seta"
                      className="seta-card"
                      onClick={() => toggleDetalhes(index)}
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
                        src={aluno.foto_url || "/imgs/foto-perfil.png"}
                        width={70}
                        height={70}
                        alt="Avatar"
                      />
                    </div>
                    <div>
                      <div className="student-name">{aluno.nome}</div>
                      <div className="student-class">
                        {aluno.curso_semestre}
                      </div>
                    </div>
                  </div>
                  <div className="student-actions">
                    <img
                      src="/imgs/arrow-student-card.svg"
                      alt="seta"
                      className="seta-card"
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
                onClick={() => deletarAluno(aluno.id_aluno)}
              />
            </div>
          </div>
        ))}
      </div>

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
  );
};

export default StudentCard;
// autora: Isabele Letícia