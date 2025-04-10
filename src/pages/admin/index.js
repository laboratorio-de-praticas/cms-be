import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Admin() {
  const router = useRouter();
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome_projeto: '',
    nome_equipe: '',
    tlr: '',
    turma: '',
    descricao: '',
    cea: '',
    area_atuacao: ''
  });

  // Carregar projetos automaticamente ao montar o componente
  useEffect(() => {
    handleGetProjetos();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/Projetos/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao criar projeto');
      }

      alert('Projeto criado com sucesso!');
      setFormData({
        nome_projeto: '',
        nome_equipe: '',
        tlr: '',
        turma: '',
        descricao: '',
        cea: '',
        area_atuacao: ''
      });
      // Recarregar projetos após criar um novo
      handleGetProjetos();
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao criar projeto');
    }
  };

  const handleGetProjetos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/Projetos/Get_all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao buscar projetos');
      }

      // Verificar se data.projetos existe e é um array
      if (data.projetos && Array.isArray(data.projetos)) {
        setProjetos(data.projetos);
      } else {
        setProjetos([]);
        console.warn('Dados de projetos não encontrados ou formato inválido');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError(error.message || 'Erro ao buscar projetos');
      setProjetos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Painel Administrativo</h1>
      
      <div>
        <h2>Criar Novo Projeto</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nome do Projeto:</label>
            <input
              type="text"
              name="nome_projeto"
              value={formData.nome_projeto}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label>Nome da Equipe:</label>
            <input
              type="text"
              name="nome_equipe"
              value={formData.nome_equipe}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label>TLR:</label>
            <input
              type="text"
              name="tlr"
              value={formData.tlr}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label>Turma:</label>
            <input
              type="text"
              name="turma"
              value={formData.turma}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label>Descrição:</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label>CEA:</label>
            <input
              type="text"
              name="cea"
              value={formData.cea}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label>Área de Atuação:</label>
            <input
              type="text"
              name="area_atuacao"
              value={formData.area_atuacao}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit">Criar Projeto</button>
        </form>
      </div>

      <div>
        <h2>Lista de Projetos</h2>
        <button onClick={handleGetProjetos}>Recarregar Projetos</button>
        
        {loading && <p>Carregando projetos...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div>
          {projetos && projetos.length > 0 ? (
            projetos.map(projeto => (
              <div key={projeto.id}>
                <h3>{projeto.nome_projeto}</h3>
                <p>Equipe: {projeto.nome_equipe}</p>
                <p>Turma: {projeto.turma}</p>
                <p>TLR: {projeto.tlr}</p>
                <p>CEA: {projeto.cea}</p>
                <p>Área de Atuação: {projeto.area_atuacao}</p>
                <p>Descrição: {projeto.descricao}</p>
                <hr />
              </div>
            ))
          ) : (
            <p>Nenhum projeto encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
} 