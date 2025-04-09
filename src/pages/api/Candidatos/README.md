# Módulo de Candidatos

## Visão Geral
Este módulo gerencia o processo de candidatura de alunos para projetos, incluindo a geração de QR Codes para candidatos aprovados.

## Funcionalidades
- Cadastro de candidatos
- Aprovação de candidatos
- Geração automática de QR Code para candidatos aprovados
- Consulta de candidatos com QR Code apenas para aprovados

## API Endpoints

### Criar Usuário com Suporte a Candidato
`POST /api/Usuarios/Create`

**Corpo da Requisição:**
```json
{
  "nome": "string",
  "email_institucional": "string",
  "senha": "string",
  "tipo_usuario": "aluno|professor|admin",
  "foto": "file (opcional)",
  // Campos específicos para alunos
  "ra": "string",
  "turma": "string",
  "curso": "string",
  "deseja_ser_candidato": boolean
}
```

**Resposta de Sucesso:**
```json
{
  "mensagem": "Usuário criado com sucesso",
  "dados": {
    "id": "string",
    "nome": "string",
    "email_institucional": "string",
    "tipo_usuario": "string",
    "foto": "string",
    "qr_code": "string (apenas para alunos aprovados)"
  }
}
```

### Aprovar Candidato
`PUT /api/Candidatos/Aprovar`

**Corpo da Requisição:**
```json
{
  "id_usuario": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "mensagem": "Candidato aprovado com sucesso",
  "dados": {
    "id": "string",
    "qr_code": "string"
  }
}
```

### Gerar QR Code para Candidato Aprovado
`PUT /api/Candidatos/Perm`

**Corpo da Requisição:**
```json
{
  "id": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "mensagem": "QR Code gerado com sucesso!",
  "qr_code": "string"
}
```

### Listar Todos os Candidatos
`GET /api/Candidatos/Get_all`

**Resposta de Sucesso:**
```json
{
  "candidatos": [
    {
      "id": "string",
      "nome": "string",
      "ra": "string",
      "turma": "string",
      "curso": "string",
      "status_candidatura": "string",
      "qr_code": "string (apenas para candidatos aprovados)"
    }
  ]
}
```

## Estrutura de Dados

### Tabela Candidatos
```sql
CREATE TABLE Candidatos (
  id TEXT PRIMARY KEY,
  ra TEXT UNIQUE NOT NULL,
  turma TEXT NOT NULL,
  curso TEXT NOT NULL,
  status_candidatura TEXT DEFAULT 'pendente',
  qr_code TEXT,
  FOREIGN KEY (id) REFERENCES Usuario(id)
);
```

## Medidas de Segurança
- Validação de dados de entrada
- Verificação de permissões
- Hash de senhas
- Geração de QR Code apenas para candidatos aprovados

## Integração
- O módulo se integra com o sistema de usuários
- QR Codes são gerados apenas para candidatos aprovados
- As imagens dos QR Codes são armazenadas em `public/imgs/candidatos/qrcodes/` 