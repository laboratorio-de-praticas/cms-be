import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import "../styles/form-student.css";

const EditStudent = () => {
    const router = useRouter();
    const { id } = router.query;

    const [formData, setFormData] = useState({
        ra: '',
        curso_semestre: '',
        deseja_ser_candidato: false,
        foto_url: '',
        data_matricula: ''
    });

    useEffect(() => {
        if (!id) return;
        
        const fetchStudentData = async () => {
            try {
                const res = await fetch(`/api/Alunos/Get_id/${id}`);
                const data = await res.json();
                
                if (res.ok && data.dados) {
                    setFormData({
                        ra: data.dados.ra || '',
                        curso_semestre: data.dados.curso_semestre || '',
                        deseja_ser_candidato: data.dados.deseja_ser_candidato || false,
                        foto_url: data.dados.foto_url || '',
                        data_matricula: data.dados.data_matricula || ''
                    });
                } else {
                    alert('Erro ao buscar dados do aluno.');
                }
            } catch (err) {
                console.error('Erro ao carregar dados do aluno:', err);
            }
        };
        
        fetchStudentData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            id_aluno: id,
            ra: formData.ra,
            curso_semestre: formData.curso_semestre,
            deseja_ser_candidato: formData.deseja_ser_candidato,
            foto_url: formData.foto_url
        };

        try {
            const response = await fetch('/api/Alunos/Update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Aluno atualizado com sucesso!');
                if (formData.deseja_ser_candidato) {
                    router.push('/eventosCandidatura');
                } else {
                    router.push('/alunos');
                }
            } else {
                alert(`Erro: ${result.mensagem}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar aluno:', error);
            alert('Erro ao enviar atualização.');
        }
    };

    return (
        <>
            <div className="divider-verde"></div>
            <div className="container-md container-form-student">
                <div className="title-form-student">
                    <div className="col-md-12 text-left my-3">
                        <h5 className="mb-0">Edição de</h5>
                        <h3 className="fw-bold">Aluno</h3>
                        <div className="divider"></div>
                    </div>
                </div>
                <form className="form-student" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Lado esquerdo - Foto */}
                        <div className="foto-container">
                            <div className="photo-box">
                                <img
                                    src={formData.foto_url || "/imgs/camera.svg"}
                                    width={80}
                                    height={80}
                                    alt="Foto do aluno"
                                />
                            </div>
                        </div>

                        {/* Lado direito - Formulário */}
                        <div className="info-container">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="deseja_ser_candidato"
                                        checked={formData.deseja_ser_candidato}
                                        onChange={handleChange}
                                        className="check-lider"
                                    />
                                    Desejo me candidatar a representante de classe
                                </label>
                            </div>

                            <div className="form-row">
                                <div className="col-6">
                                    <div className="form-field ra">
                                        <input
                                            type="text"
                                            name="ra"
                                            value={formData.ra}
                                            onChange={handleChange}
                                            className="styled-input inp-ra"
                                            placeholder="RA"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="form-field data">
                                        <input
                                            type="text"
                                            name="data_matricula"
                                            value={formData.data_matricula}
                                            className="styled-input inp-data"
                                            placeholder="Data de Matrícula"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="col-12">
                                    <div className="form-field sem">
                                        <input
                                            type="text"
                                            name="curso_semestre"
                                            value={formData.curso_semestre}
                                            onChange={handleChange}
                                            className="styled-input inp-sem"
                                            placeholder="Curso e Semestre (ex: DSM3)"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="button-group">
                                <button type="submit" className="btn btn-warning">
                                    Salvar Alterações
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-danger"
                                    onClick={() => router.push('/alunos')}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditStudent;