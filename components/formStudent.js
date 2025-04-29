import { useState, useEffect } from "react";
import "../src/styles/form-student.css";

const FormStudent = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    fk_id_usuario: 6, // Fixo para testes
    foto_url: "",
    deseja_ser_candidato: false,
    curso_semestre: "",
    ra: '',
    data_matricula: "",
  });

  useEffect(() => {
    setShowPopup(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const uploadFoto = async (file) => {
    const formData = new FormData();
    formData.append("imagem", file);

    try {
      const response = await fetch("/api/Alunos/Uploads/UploadFoto", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensagem || "Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      return data.foto_url;
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
      throw error;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFoto(file).then((foto_url) => {
        setFormData((prev) => ({ ...prev, foto_url }));
        setImagePreviewUrl(URL.createObjectURL(file)); // Atualiza preview local para fade-in
      }).catch((error) => {
        console.error("Erro ao carregar foto:", error);
        alert("Erro ao carregar foto.");
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/Alunos/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      console.error("Erro ao enviar dados:", error);
      alert("Erro de conexão com o servidor.");
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
            {/* Lado esquerdo - Upload da foto */}
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
                    src={imagePreviewUrl || formData.foto_url || "/imgs/camera.svg"}
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

            {/* Lado direito - Dados do aluno */}
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
