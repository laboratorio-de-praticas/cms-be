import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email_institucional: '',
    senha: ''
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
      const response = await fetch('/api/Usuarios/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao fazer login');
      }
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      // Redirecionar para o painel admin
      router.push('/admin');
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao fazer login');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
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
        
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
} 