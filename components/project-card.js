import "../src/styles/project-card.css";
import React, { useState } from "react";

const ProjectCard = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar se o card está expandido

  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // Alterna entre expandido e minimizado
  };

  return (
    <div className="container-project-card">
      {!isExpanded ? (
        // minimizado
        <div className="card-project-minimizado">
          <div className="project-img">
            <img src="/imgs/project-img.png" alt="Logo do projeto" />
          </div>

          <div className="infos-proj">
            <div className="top-info">
              <div className="titulo-e-turma">
                <h4 className="nome">Kastle - Learny</h4>
                <p className="turma">DSM 4</p>
              </div>

              <div className="acoes">
                <span className="status ativo">Ativo</span>
                <button className="editar">Editar</button>
                <button className="deletar">Deletar</button>
                <div className="expandir" onClick={toggleExpand}>
                  <img
                    src="/imgs/arrow-student-card.svg"
                    alt="Expandir"
                  />
                </div>
              </div>
            </div>

            <div className="members">
              <img src="/imgs/foto-perfil.png" width={50} height={50} alt="Membro 1" />
              <img src="/imgs/foto-perfil2.png" width={50} height={50} alt="Membro 2" />
              <img src="/imgs/foto-perfil2.png" width={50} height={50} alt="Membro 3" />
            </div>
          </div>
        </div>
      ) : (
        // maximizado
        <div className="card-project-expandido">
            <div className="borda">
        <div className="card-maximizado"> {/* Aqui fica o card com borda */}
            <div className="project-img-expanded">
            <span className="status ativo-expanded">Ativo</span>
            <img src="/imgs/project-img.png" width={150} height={150} alt="Logo do projeto" />
            </div>
            
            <div className="infos-proj">
            <div className="top-info-expanded">
                <div className="expandir" onClick={toggleExpand}>
                <img src="/imgs/arrow-down-student.svg" alt="Recolher" />
                </div>
            </div>

            <div className="middle-info">
                <div className="titulo-e-turma">
                <h4 className="nome">Kastle - Learny</h4>
                <p className="turma">DSM 4</p>
                <p className="descricao">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et 
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip 
                    ex ea commodo consequat. Lorem ipsum dolor sit amet
                </p>
                </div>
                <div className="destaque">
                <p className="classificacao">TRE 6</p>
                <p className="eventos">Hub Tec'25</p>
                <p className="eventos">FTX'25</p>
                </div>
            </div>

            {/* Áreas vem separada agora pra ocupar mais largura */}
            

            
            </div>
        </div>
        <div className="areas">
                <p>Tecnologia e Produção</p>
                <p>Tecnologia e Produção</p>
                <p>Tecnologia e Produção</p>
            </div>
            <div className="bottom-info">
                <div className="linhas">
                <p>Pessoas com Deficiências Incapacidades, e Necessidades Especiais</p>
                <p>Pessoas com Deficiências Incapacidades, e Necessidades Especiais</p>
                <p>Pessoas com Deficiências Incapacidades, e Necessidades Especiais</p>
                </div>
            </div>
            </div>

        {/* Botões FORA do card */}
        <div className="acoes-fora">
            <button className="editar-expanded">Editar</button>
            <button className="deletar-expanded">Excluir</button>
        </div>
        </div>

      )}
      
    </div>
  );
};

export default ProjectCard;
