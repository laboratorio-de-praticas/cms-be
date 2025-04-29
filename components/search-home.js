import "../src/styles/search-home.css";
import React from "react";

const SearchHome = ({ onProjetoClick, onAlunoClick}) => {
  return (
    <div className="search-container-fluid container-filtros-dsm">
      <div className="row">
        <div className="col-12 d-flex flex-wrap align-items-center gap-2 mb-3">
          {/*btn todos/candidatos*/}
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="grupo1"
              id="option1"
              autoComplete="off"
              defaultChecked
            />
            <label className="btn btn-branco" htmlFor="option1">
              Todos
            </label>

            <input
              type="radio"
              className="btn-check"
              name="grupo1"
              id="option2"
              autoComplete="off"
            />
            <label className="btn btn-branco" htmlFor="option2">
              Candidatos
            </label>
          </div>

          {/* btn aluno e projeto */}
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="grupo2"
              id="option3"
              autoComplete="off"
              defaultChecked
              onClick={onAlunoClick}
            />
            <label className="btn btn-branco" htmlFor="option3">
              Aluno
            </label>

            <input
              type="radio"
              className="btn-check"
              name="grupo2"
              id="option4"
              autoComplete="off"
              onClick={onProjetoClick}
            />
            <label className="btn btn-branco" htmlFor="option4">
              Projeto
            </label>
          </div>

          {/* pesquisa */}
          <div className="search-bar-dsm d-flex align-items-center flex-grow-1">
            <div className="search-input-container-dsm flex-grow-1 me-2">
              <img
                src="/imgs/search.svg"
                alt="Search"
                className="search-icon-dsm"
              />
              <input
                type="text"
                className="search-input-dsm w-100"
                placeholder="Pesquisar aluno"
              />
            </div>
            <button className="search-button-dsm">Pesquisar</button>
          </div>
        </div>

        {/*dropdown + btn DSM/GE*/}
        <div className="d-flex align-items-center gap-2">
          <div className="custom-dropdown-dsm me-2">
            <select className="dropdown-select-dsm">
              <option value="dsm">DSM</option>
              <option value="ge">GE</option>
            </select>
            <img
              src="/imgs/drop-curso.svg"
              alt="Seta"
              className="dropdown-arrow-dsm"
            />
          </div>

          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="grupo3"
              id="option5"
              autoComplete="off"
              defaultChecked
            />
            <label className="btn btn-branco" htmlFor="option5">
              DSM
            </label>

            <input
              type="radio"
              className="btn-check"
              name="grupo3"
              id="option6"
              autoComplete="off"
            />
            <label className="btn btn-branco" htmlFor="option6">
              GE 
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHome;
// autora: Isabele Letícia