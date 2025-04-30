import React, { useState } from 'react'
import "../styles/edit-projects.css"

function EditProjects() {
  const [formData, setFormData] = useState({
    turma: 'DSM',
    nomeProjeto: '',
    integrantes: '',
    semestre: '',
    notaTrl: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Projeto cadastrado com sucesso!');
    setFormData({
      turma: 'DSM',
      nomeProjeto: '',
      integrantes: '',
      semestre: '',
      notaTrl: '',
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
        ...prev,
        foto: file
    }));
};

  const handleCancel = () => {
    if (window.confirm('Deseja cancelar o cadastro?')) {
      setFormData({
        turma: 'DSM',
        nomeProjeto: '',
        equipe:'',
        integrantes: '',
        semestre: '',
        resumo:'',
        notaTrl: '',
      });
    }
  };

  return (
    <>
    <div className="divider-azul"></div>
    <div className="container-projeto">
      <form className="form-projeto" onSubmit={handleSubmit}>
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="foto-turma d-flex align-items-start">
                {/* lado esquerdo */}
                <div className="foto-container">
                  <div className="photo-box">
                    <input type="file" accept="image/*" id="imageUpload" style={{ display: 'none' }} onChange={handleImageChange} />
                      <label htmlFor="imageUpload">
                        <img src="/imgs/camera.svg" width={80} height={80} alt="Upload Image" />
                      </label>
                  </div>
                </div>
                {/* lado direito */}
                <div className="info-container">
                        <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="form-field">
                              <input 
                                  type="text" 
                                  name="equipe" 
                                  value={formData.equipe} 
                                  onChange={handleChange} 
                                  className="styled-input equipe"
                                  placeholder="Equipe:"
                              />
                            </div>
                            <div className="toggle-group">
                                <button type="button" className={`btnazul ${formData.curso === 'DSM' ? 'active' : ''}`}  onClick={() => handleCursoChange('DSM')}>DSM</button>
                                <button type="button" className={`btnbranco ${formData.curso === 'GE' ? 'active' : ''}`} onClick={() => handleCursoChange('GE')}>GE</button>
                            </div>
                            <div className="form-field">
                              <div className="semestre-group">
                                <label className="semestre-label"><strong>Semestre:</strong></label>
                                <input 
                                  type="text" 
                                  name="ano" 
                                  value={formData.ano} 
                                  onChange={handleChange} 
                                  placeholder="2023"
                                  className="input-semestre input-ano"
                                />
                                <span className="separator">|</span>
                                <input 
                                  type="text" 
                                  name="numeroSemestre" 
                                  value={formData.numeroSemestre} 
                                  onChange={handleChange} 
                                  placeholder="2"
                                  className="input-semestre input-num"
                                />
                              </div>
                            </div>
                          
                        </div>

                        <div className="form-field">
                            <input 
                                type="text" 
                                name="nomeProjeto" 
                                value={formData.Projeto} 
                                onChange={handleChange} 
                                className="styled-input nomeproj"
                                placeholder="Projeto:"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-field ra">
                              <textarea
                                name="resumo"
                                value={formData.resumo}
                                onChange={handleChange}
                                className="styled-input resumo"
                                placeholder="Resumo:"
                              />
                            </div>
                        </div>

                    </div>
              </div>
            </div>
          </div>
          <div className="row row-border d-flex justify-content-center g-3 mt-3 pesquisa">
          <div className="col-md-12 d-flex align-items-center mb-4">
            <div className="search-wrapper me-3">
              <input className="search" placeholder="Pesquisar aluno" />
              <img src="/imgs/search-blue.svg" alt="Ícone de lupa" className="search-icon" />
            </div>
            <button className="btn-add">Adicionar</button>
          </div>
              {/* <!-- Card do aluno (repita quantos quiser) --> */}
              <div className="aluno-card">
                <img src="/imgs/foto-perfil.png" height={40} width={40} alt="Foto do aluno" className="foto-aluno" />
                <p className="nome-aluno">Nome Completo Aqui</p>
                <img src="/imgs/excluir-card.svg" height={20} width={20} alt="Excluir" className="icone-excluir" />
              </div>
            </div>

          <div className="row row-border g-3 areaconj">
  <div className="col-md-12 title-proj"> Áreas Temáticas (máx. 3) </div>

  <div className="d-flex justify-content-center flex-wrap gap-4">
    <div className="col-md-5 d-flex flex-column align-items-end">
      <div className="form-check d-flex align-items-center">
        <label className="form-check-label me-2" htmlFor="check1">Comunicação</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check1" />
      </div>
      <div className="form-check d-flex align-items-center">
        <label className="form-check-label me-2" htmlFor="check2">Meio Ambiente</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check2" />
      </div>
      <div className="form-check d-flex align-items-center">
        <label className="form-check-label me-2" htmlFor="check3">Cultura</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check3" />
      </div>
      <div className="form-check d-flex align-items-center mb-3">
        <label className="form-check-label me-2" htmlFor="check4">Saúde</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check4" />
      </div>
    </div>

    <div className="col-md-5 d-flex flex-column align-items-end">
      <div className="form-check d-flex align-items-center">
        <label className="form-check-label me-2" htmlFor="check5">Direitos Humanos</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check5" />
      </div>
      <div className="form-check d-flex align-items-center">
        <label className="form-check-label me-2" htmlFor="check6">Tecnologia e Produção</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check6" />
      </div>
      <div className="form-check d-flex align-items-center">
        <label className="form-check-label me-2" htmlFor="check7">Educação</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check7" />
      </div>
      <div className="form-check d-flex align-items-center mb-3">
        <label className="form-check-label me-2" htmlFor="check8">Trabalho</label>
        <input className="form-check-input custom-checkbox" type="checkbox" id="check8" />
      </div>
    </div>
  </div>
</div>

          {/* extensao */}
          <div className="row row-border d-flex justify-content-center g-3 mt-3 extensao">
          <div className="col-md-12 title-proj">Linhas de Extensão (máx. 5) </div>
          <div className="col-md-9 d-flex justify-content-center mb-4">
            <div className="search-wrapper">
              <input className="search" placeholder="Pesquisar aluno" />
              <img src="/imgs/search-blue.svg" alt="Ícone de lupa" className="search-icon" />
            </div>
          </div>
            <div className="col-md-3 d-flex justify-content-center mb-4">
              <button className="btn-add">Adicionar</button>
            </div>
          </div>
          {/* eventos */}
          <div className="row row-border d-flex justify-content-center g-3">
            <div className="col-md-12 title-add mb-4 title-proj"> Cadastro em Evento </div>
            <div className="col-md-9 d-flex justify-content-between align-items-center mb-4 evento">
              <div className="text-white ms-5 title-event">HubTec´25</div>
              <button className="btn-inscri me-5">Inscrever-se</button>
            </div>
            <div className="col-md-9 d-flex justify-content-between align-items-center mb-4 evento">
              <div className="text-white ms-5 title-event">FTX´25</div>
              <button className="btn-inscri-y me-5">Inscrito</button>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-12">
              <button className="btn-cadastrar">Editar</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </>
  );
}

export default EditProjects;
