import { useState } from 'react';
import SearchHome from '../../components/search-home.js';
import StudentCard from '../../components/student-card.js';
import ProjectCard from '../../components/project-card.js';

export default function Gerenciar() {
  const [mostrarProjeto, setMostrarProjeto] = useState(false);

  return (
    <>
      <main>
        <SearchHome
          onProjetoClick={() => setMostrarProjeto(true)}
          onAlunoClick={() => setMostrarProjeto(false)}
        />

        {mostrarProjeto ? <ProjectCard /> : <StudentCard />}
      </main>
    </>
  );
}
