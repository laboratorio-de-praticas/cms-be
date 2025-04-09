import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CriarAdmin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email_institucional: '',
    senha: '',
    tipo_usuario: 'admin'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/Usuarios/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao criar admin');
      }

      alert('Admin criado com sucesso!');
      router.push('/login');
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao criar admin');
    }
  };

  return (
    <div>
      <h1>Criar Usuário Admin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label>Email Institucional:</label>
          <input
            type="email"
            name="email_institucional"
            value={formData.email_institucional}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button type="submit">Criar Admin</button>
      </form>
    </div>
  );
} 