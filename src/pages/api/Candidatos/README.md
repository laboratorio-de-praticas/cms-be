# Módulo de Candidatos

## Visão Geral
O módulo de Candidatos gerencia o cadastro e aprovação de candidatos (alunos que desejam se candidatar a representantes de turma). Cada candidato aprovado recebe um QR Code único para identificação.

## Endpoints

### 1. Criar Usuário com Suporte a Candidato
```
POST /api/Usuarios/Create
```
- Cria um novo usuário com suporte a candidato
- Body (form-data):
  - nome (obrigatório): string
  - email_institucional (obrigatório): string (formato: @fatec.sp.gov.br)
  - senha (obrigatório): string
  - tipo_usuario (obrigatório): "aluno" | "professor" | "admin"
  - foto: arquivo de imagem
  - ra (apenas para alunos): string
  - turma (apenas para alunos): string
  - curso (apenas para alunos): string
- Resposta:
```json
{
  "mensagem": "Usuário criado com sucesso",
  "usuario": {
    "id": "uuid",
    "nome": "string",
    "email_institucional": "string",
    "tipo_usuario": "string",
    "foto": "string",
    "ra": "string",
    "turma": "string",
    "curso": "string"
  }
}
```

### 2. Aprovar Candidato
```
PUT /api/Candidatos/Aprovar
```
- Aprova um candidato e gera seu QR Code
- Body (JSON):
```json
{
  "id_usuario": "uuid"
}
```
- Resposta:
```json
{
  "mensagem": "Candidato aprovado com sucesso",
  "dados": {
    "id_usuario": "uuid",
    "qr_code": "string"
  }
}
```

### 3. Gerar QR Code para Candidato
```
PUT /api/Candidatos/Perm
```
- Gera um novo QR Code para um candidato aprovado
- Body (JSON):
```json
{
  "id_usuario": "uuid"
}
```
- Resposta:
```json
{
  "mensagem": "QR Code gerado com sucesso",
  "dados": {
    "id_usuario": "uuid",
    "qr_code": "string"
  }
}
```

### 4. Listar Todos os Candidatos
```
GET /api/Candidatos/Get_all
```
- Retorna todos os candidatos
- Resposta:
```json
{
  "candidatos": [
    {
      "id": "uuid",
      "nome": "string",
      "email_institucional": "string",
      "ra": "string",
      "turma": "string",
      "curso": "string",
      "foto": "string",
      "status": "string",
      "qr_code": "string"
    }
  ],
  "total": number
}
```

## Estrutura de Dados

### Tabela Usuario
```sql
CREATE TABLE Usuario (
  id_usuario TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email_institucional TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL,
  foto TEXT
);
```

### Tabela Candidato
```sql
CREATE TABLE Candidato (
  id TEXT PRIMARY KEY,
  ra TEXT NOT NULL,
  turma TEXT NOT NULL,
  curso TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  qr_code TEXT
);
```

## Observações
- Todos os endpoints retornam status 200 em caso de sucesso
- Em caso de erro, retornam status 400, 401, 404 ou 500 com mensagem de erro
- O email institucional deve ser único e seguir o formato @fatec.sp.gov.br
- A senha é armazenada com hash bcrypt
- Os QR Codes são gerados automaticamente e salvos em `public/imgs/candidatos/qrcodes/`
- Apenas alunos podem ser candidatos
- O status do candidato pode ser: "pendente", "aprovado" ou "reprovado" 