import { useUser } from '../../context/userContext';
import "../styles/menu-profile.css";
import { useState } from 'react';

const MenuProfile = ({
  menuAberto,
  fecharMenu,
  nome = "Calebe Cardoso Almeida Pereira",
  cursoOuSetor = "DSM 4",
  grupo = {
    nome: "Learny",
    descricao: "Ensino de Inglês Gamificado para crianças com TEA."
  },
  integrantes = [
    { nome: "Calebe", foto: "/imgs/foto-perfil.png", cursoOuSetor: "DSM 4", papel: "Líder" },
    { nome: "João", foto: "/imgs/foto-perfil2.png", cursoOuSetor: "DSM 4", papel: "Dev" },
    { nome: "Ana", foto: "/imgs/foto-perfil.png", cursoOuSetor: "DSM 4", papel: "Design" },
    { nome: "Maria", foto: "/imgs/foto-perfil2.png", cursoOuSetor: "DSM 4", papel: "Scrum Master" }
  ]
}) => {
  const { userType } = useUser();
  const [perfilAtivo, setPerfilAtivo] = useState(null);

  const exibirPerfil = perfilAtivo || {
    nome,
    cursoOuSetor,
    papel: "Líder", // cargo padrão do usuário
    grupo,
  };

  const isPerfilDoIntegrante = perfilAtivo !== null;

  return (
    <>
      {menuAberto && <div className="shadow-overlay" onClick={() => { fecharMenu(); setPerfilAtivo(null); }}></div>}

      <div className={`menu-perfil-container ${menuAberto ? "aberto" : ""}`}>
        <div className="row">
          <img
            src="/imgs/close-x.svg"
            className="close-menu"
            width={20}
            height={20}
            alt="Fechar"
            onClick={() => {
              fecharMenu();
              setPerfilAtivo(null);
            }}
          />
        </div>

        <div className="row">
          <div className="col-md">
            <img
              className="foto-perfil-menu"
              src={
                integrantes.find((i) => i.nome === exibirPerfil.nome)?.foto ||
                "/imgs/foto-perfil.png"
              }
              alt="Foto do perfil"
            />
          </div>
        </div>

        <div className="row">
          {userType === "aluno" ? (
            <div className="profile-description">
              <p className="nome-perfil-menu">{exibirPerfil.nome}</p>
              <p className="curso-perfil-menu">{exibirPerfil.cursoOuSetor}</p>
              <p className="tipo-usuarioperfil-menu">Aluno - {exibirPerfil.papel}</p>
              <div className="profile-divider"></div>
              <p className="nome-grupo-menu">{grupo.nome}</p>
              <p className="descgrupo-menu">{grupo.descricao}</p>
              <div className="integrantes">
                {integrantes.map((integrante, index) => (
                  <a
                    key={index}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPerfilAtivo(integrante);
                    }}
                  >
                    <img
                      src={integrante.foto}
                      width={50}
                      height={50}
                      alt={`Integrante ${integrante.nome}`}
                      style={{ cursor: 'pointer' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="profile-description-adm">
              <p className="nome-perfil-menu">{nome}</p>
              <p className="curso-perfil-menu">{cursoOuSetor}</p>
              <p className="tipo-usuarioperfil-menu">ADM</p>
            </div>
          )}
        </div>

        <div className="row">
          {isPerfilDoIntegrante ? (
            <button
              className="voltar-perfil"
              onClick={() => setPerfilAtivo(null)}
            >
              Voltar
            </button>
          ) : (
            <button
            className="editar-perfil"
            onClick={() => window.location.href = '/editStudent'}
          >
            Editar Perfil
          </button>

          )}
        </div>

        <div className="row">
          <button className="sair-perfil">Sair </button>
        </div>

        {userType === "adm" && (
          <>
            <div className="row">
              <div className="profile-divider"></div>
            </div>
            <div className="row">
              <button className="pedidos-menu">Pedidos</button>
            </div>
            <div className="row">
              <button className="editar-projeto">Editar Projetos/Usuário</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MenuProfile;
