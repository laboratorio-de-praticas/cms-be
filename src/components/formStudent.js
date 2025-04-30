import { useState, useEffect } from "react";
import "../styles/form-student.css";

const FormStudent = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const [formData, setFormData] = useState({
    fk_id_usuario: 6, //Fixo para teste
    fk_id_evento: 3, //Fixo para teste
    foto_url: "",
    deseja_ser_candidato: false,
    descricao_campanha: "", 
    curso_semestre: "",
    ra: "",
    data_matricula: "",
  });

  useEffect(() => {
    setShowPopup(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemSelecionada(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let foto_url = formData.foto_url;

      if (imagemSelecionada) {
        const uploadFormData = new FormData();
        uploadFormData.append("imagem", imagemSelecionada);

        const uploadResponse = await fetch("/api/Alunos/Uploads/UploadFoto", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.mensagem || "Erro ao enviar imagem");
        }

        foto_url = uploadResult.foto_url;
      }

      const alunoPayload = {
        ...formData,
        foto_url,
        fk_id_evento: formData.deseja_ser_candidato ? formData.fk_id_evento : null,
      };

      const response = await fetch("/api/Alunos/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alunoPayload),
      });

      const result = await response.json();

      if (response.status === 201) {
        alert("Aluno cadastrado com sucesso!");
        window.location.href = "/eventosCandidatura";
      } else if (response.status === 409 && result.mensagem === "Aluno já cadastrado") {
        alert("Este aluno já está cadastrado. Redirecionando...");
        window.location.href = "/eventosCandidatura";
      } else {
        alert(`Erro: ${result.mensagem}\n${result.detalhes || ""}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      alert("Erro ao cadastrar aluno.");
    }
  };

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h5 className="fw-bold">Para prosseguir, confirme seu cadastro</h5>
            <br />
            <button className="btn btn-success" onClick={() => setShowPopup(false)}>
              Ok
            </button>
          </div>
        </div>
      )}

      <div className="divider-verde"></div>
      <div className="container-md container-form-student">
        <div className="title-form-student">
          <div className="col-md-12 text-left my-3">
            <h5 className="mb-0">Continuação do</h5>
            <h3 className="fw-bold">Cadastro de Alunos</h3>
            <div className="divider"></div>
          </div>
        </div>

        <form
          className="form-student"
          method="POST"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="form-grid">
            <div className="foto-container">
              <div className="photo-box">
                <input
                  type="file"
                  accept="image/*"
                  id="imageUpload"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label htmlFor="imageUpload" style={{ cursor: "pointer" }}>
                  <img
                    src={imagePreviewUrl || "/imgs/camera.svg"}
                    width={150}
                    height={150}
                    alt="Foto do aluno"
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #28a745",
                      transition: "opacity 0.5s ease-in-out",
                      opacity: imagePreviewUrl ? 1 : 0.8,
                    }}
                  />
                </label>
              </div>
            </div>

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
                  Desejo me candidatar a representante de classe.
                </label>
              </div>

              {formData.deseja_ser_candidato && (
                <div className="form-field">
                  <textarea
                    name="descricao_campanha"
                    value={formData.descricao_campanha}
                    onChange={handleChange}
                    className="styled-input inp-nome"
                    placeholder="Descrição da campanha:"
                    rows={4}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="col-6">
                  <div className="form-field ra">
                    <input
                      type="text"
                      name="ra"
                      value={formData.ra}
                      onChange={handleChange}
                      className="styled-input inp-ra"
                      placeholder="RA:"
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-field data">
                    <input
                      type={dateFocused ? "date" : "text"}
                      onFocus={() => setDateFocused(true)}
                      name="data_matricula"
                      value={formData.data_matricula}
                      onChange={handleChange}
                      className="styled-input inp-data"
                      placeholder="Data de Matrícula:"
                      required
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
                      placeholder="Semestre Atual: (ex.: DSM1)"
                    />
                  </div>
                </div>
              </div>

              <div className="row-final">
                <div className="button-group">
                  <button type="submit" className="btn btn-success">
                    Cadastrar
                  </button>
                  <a href="/eventosCandidatura" className="btn btn-outline-danger">
                    Cancelar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormStudent;
