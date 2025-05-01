import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import "../src/styles/eventos-adm.css";
const ShowEventos = () => {
  const [Eventos, setEventos] = useState([]);
  // Fetch dos dados da API
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch("/api/Eventos/Get_all", {
          cache: "no-store",
        });
 
        if (!response.ok) {
          throw new Error("Erro ao buscar eventos");
        }
 
        const data = await response.json();
        console.log(data)
        setEventos(data.eventos);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar Eventos:", err);
      }
    };
 
    fetchEventos();
   
  }, []);
  return (
    <div className="container-md container-eventos-adm">
      <div className="d-flex justify-content-center">
        <div className="row align-items-center" style={{ width: "100%" }}>
          <div className="col-6">
            <div className="title-eventos-adm">
              <p>Ver</p>
              <h3>Eventos</h3>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <div className="btn-wrapper">
              <a href="#" className="ocultar">
                Ocultar Todos
              </a>
              <span>|</span>
              <a href="/CadEvents" className="cadastrar">
                Cadastrar
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="divider-evadm"></div>
        {Eventos.map((evento) => (
        <div key={evento.id_evento} className="row">
          <div  className="card-evento">
            <h3 className="evento-title">{evento.nome_evento}</h3>
            <div className="acoes-evento">
              <a href="/editEvents/" className="editar-evento">
                Editar
              </a>
              <a href="#" className="deletar-evento">
                Deletar
              </a>
            </div>
          </div>
        </div>
            ))}
    </div>
  );
};
export default ShowEventos;