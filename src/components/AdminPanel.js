import React from 'react';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const administrador = {
    nome: 'Joana Silva',
    email: 'joana.admin@empresa.com',
    permissao: 'Total',
  };

  return (
    <div className="admin-panel-container">
      <h2>Informações do Administrador</h2>
      <div className="card-admin">
        <p><strong>Nome:</strong> {administrador.nome}</p>
        <p><strong>Email:</strong> {administrador.email}</p>
        <p><strong>Permissão:</strong> {administrador.permissao}</p>
      </div>
    </div>
  );
}

export default AdminPanel;
