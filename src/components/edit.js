const Edit=()=>{
    return(
        <div className="container" style={{ color: '#004854' }}>
            <div className="row">
                <div className="col-md-4">
                    <h5>Cadastro</h5>
                    <h3 className='fw-bold'>Alunos</h3>
                </div>
                <hr />
            </div>

            <form className="g-3" method="POST" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-3">
                        <div className="btn-group grupo-1" role="group">
                            <input type="radio" className="btn-check" name="curso" id="option1" autoComplete="off" value="DSM" onChange={handleCursoChange} />
                            <label className="btn btn-secondary" htmlFor="option1">DSM</label>
                            <input type="radio" className="btn-check" name="curso" id="option2" autoComplete="off" value="GE" onChange={handleCursoChange} />
                            <label className="btn btn-secondary" htmlFor="option2">GE</label>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854'}}>Semestre Atual:</span>
                            <input type="text" className="form-control border-start-0" name="turma_atual" value={formData.turma_atual} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Nome */}
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>Nome:</span>
                            <input type="text" className="form-control border-start-0" name="nome" value={formData.nome} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Email Institucional */}
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>Email Institucional:</span>
                            <input type="email" className="form-control border-start-0" name="email_institucional" value={formData.email_institucional} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Telefone e RA */}
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-3">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>Celular:</span>
                            <input type="text" className="form-control border-start-0" name="telefone" value={formData.telefone} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>RA:</span>
                            <input type="text" className="form-control border-start-0" name="ra" value={formData.ra} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Ano de Ingresso e Senha */}
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-3">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>Ano de Ingresso:</span>
                            <input type="text" className="form-control border-start-0" name="ano_ingresso" value={formData.ano_ingresso} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>Senha:</span>
                            <input type="password" className="form-control border-start-0" name="senha" value={formData.senha} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Foto */}
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text fw-bold bg-white" style={{ color: '#004854' }}>Foto 3x4:</span>
                            <input type="file" className="form-control border-start-0" name="foto" onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Candidato e Líder */}
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group gap-3">
                            <div className="fw-bold">Desejo me cadastrar como Representante de Turma</div>
                            <input className="form-check-input" type="checkbox" name="deseja_ser_candidato" checked={formData.deseja_ser_candidato} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <br />
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group gap-3">
                            <div className="fw-bold">Desejo me cadastrar como Líder do grupo PI</div>
                            <input className="form-check-input" type="checkbox" name="deseja_ser_lider" checked={formData.deseja_ser_lider} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <br />
                <div className="row d-flex justify-content-center">
                    <button type="submit" className="btn btn-success col-md-6">Cadastrar</button>
                </div>
            </form>
        </div>
    )
}
export default Edit