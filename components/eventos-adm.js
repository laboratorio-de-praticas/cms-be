import React from 'react';
import { useRouter } from 'next/router';
import "../src/styles/eventos-adm.css";
const ShowEventos = () => {
    return(
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
                    <a href="#" className='ocultar'>Ocultar Todos</a>
                    <span>|</span>
                    <a href="/CadEvents" className='cadastrar'>Cadastrar</a>
                    </div>
                </div>
                </div>
            </div>
            <div className="divider-evadm"></div>
            <div className="row">
                <div className="card-evento">
                <h3 className="evento-title">HubTec'25</h3>
                <div className="acoes-evento">
                    <a href="/editEvents" className="editar-evento">Editar</a>
                    <a href="#" className="deletar-evento">Deletar</a>
                </div>
                </div>
            </div>
            </div>

    );
}
export default ShowEventos;