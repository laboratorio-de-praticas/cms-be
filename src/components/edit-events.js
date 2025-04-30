import React from "react";
import { useRouter } from "next/router";
import "../styles/form-events.css";
const EditEventsComponent = () => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      foto: file,
    }));
  };
  return (
    <div className="container-md container-cadevento">
      <div className="row">
        <div className="col-6">
          <div className="title-cadevento">
            <p>Edição de</p>
            <h3>Eventos</h3>
          </div>
        </div>
        <div className="col-6">
          {/* alternar o status */}
          <div className="status-desativar">
            <div className="status">
              <p className="ativ">Ativado</p>
            </div>
            {/* <div className="status-des">
                            <p className='desativ'>Desativado</p>
                        </div> */}
            {/* o botao deve altenar entre esses dois */}
            <button className="desativar">Desativar</button>
            {/* <button className="ativar">Ativar</button> */}
          </div>
        </div>
      </div>
      <div className="divider-cadevento"></div>
      <form action="">
        <div className="row">
          <div className="photo-box">
            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label htmlFor="imageUpload">
              <img
                src="/imgs/camera.svg"
                width={80}
                height={80}
                alt="Upload Image"
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <input
              type="text"
              className="form-control nome-evento"
              placeholder="Nome:"
            />
          </div>
          <div className="col-md-6 mb-3">
            <input
              type="text"
              className="form-control tipo-evento"
              placeholder="Tipo:"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <input
              type="number"
              className="form-control semestre-evento"
              placeholder="Semestre:"
            />
          </div>
          <div className="col-md-6 mb-3">
            <input
              type="number"
              className="form-control ano-semestre-evento"
              placeholder="Ano do Semestre:"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-12 mb-3">
            <textarea
              className="form-control descricao-evento"
              placeholder="Descrição:"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <button type="submit" className="btn editar-evento w-100">
              Editar
            </button>
          </div>
          <div className="col-md-6 mb-3">
            <button type="button" className="btn cancelar-evento w-100">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default EditEventsComponent;
