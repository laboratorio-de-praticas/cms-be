import { useRouter } from "next/router";
import "../src/styles/navbar.css";
import { useUser } from "../context/userContext.js";
import { useEffect, useState } from "react";

const Navbar = ({ abrirMenu }) => {
  const router = useRouter();
  const caminhoAtual = router.pathname;
  const estaNoIndex = caminhoAtual === "/";
  const { userType, curso } = useUser();

  const [menuAbertoNavbar, setMenuAbertoNavbar] = useState(false);

  const toggleMenu = () => setMenuAbertoNavbar(!menuAbertoNavbar);

  useEffect(() => {
    const nav = document.querySelector('nav');
    if (nav && curso === "GE") {
      nav.style.backgroundColor = "#0B9247";
    }
  }, [curso]); 



  return (
    <nav className="navbar navbar-expand-lg nav-padrao" data-curso="GE">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img
            className="logo-cps-55"
            src="/imgs/2024_logo_55anos_cps_gov_24-25_regua_horizontal+horizontal_br 1.png"
            alt="Logo CPS"
            width={235.24}
            height={56.8}
          />
        </a>

        {/* HAMBURGUER */}
        {!estaNoIndex && (
          <button className="hamburguer-btn" onClick={toggleMenu}>
            <img
              src="/imgs/hamburguer-branco.png"
              alt="Menu"
              height={13}
              width={20}
            />
          </button>
        )}

        <div
          className={`collapse navbar-collapse ${
            menuAbertoNavbar ? "show-menu-navbar" : ""
          }`}
          id="navbarNavDropdown"
        >
          <ul className="navbar-nav">
            <li className="nav-item home-item">
              <a
                className={`nav-link ${
                  ["/homeLogado", "/"].includes(caminhoAtual)
                    ? "active-page"
                    : ""
                }`}
                href="/homeLogado"
              >
                Home
              </a>
            </li>

            {/* Separador após Home, apenas uma vez */}
            {estaNoIndex && <li className="separador"></li>}

            {estaNoIndex && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Cadastro
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <a className="dropdown-item" href="/cadastro/usuario">
                      Usuário
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="/cadastro/projeto">
                      Projeto
                    </a>
                  </li>
                </ul>
              </li>
            )}

            {/* Separador após Cadastro, se necessário */}
            {estaNoIndex && <li className="separador"></li>}

            {userType === "adm" && (
              <>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      caminhoAtual === "/gerenciar" ? "active-page" : ""
                    }`}
                    href="/gerenciar"
                  >
                    Gerenciar
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      caminhoAtual === "/pedidos" ? "active-page" : ""
                    }`}
                    href="/pedidos"
                  >
                    Pedidos
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      caminhoAtual === "/eventos" ? "active-page" : ""
                    }`}
                    href="/eventos"
                  >
                    Eventos
                  </a>
                </li>
              </>
            )}

            {/* Separador para "aluno", se necessário */}
            {userType === "aluno" && <li className="separador"></li>}

            {userType === "aluno" && (
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    caminhoAtual === "/formProject" ? "active-page" : ""
                  }`}
                  href="/formProject"
                >
                  Cadastrar
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Oculta a foto de perfil no mobile quando o menu está aberto */}
        {!estaNoIndex && !menuAbertoNavbar && (
          <div
            className="perfil-retangulo"
            onClick={(e) => {
              e.preventDefault();
              abrirMenu();
            }}
          >
            <img
              src="/imgs/foto-perfil.png"
              alt="Foto de Perfil"
              className="foto-perfil"
            />
            <div className="info-perfil">
              <span className="nome-perfil">José Alves da Silva</span>
              <span className="turma-perfil">DSM-4</span>
            </div>
            <img src="/imgs/vector-down.svg" alt="" className="icon-vector" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
