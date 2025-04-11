# Módulo de Usuários

## Visão Geral
O módulo de Usuários gerencia o cadastro e autenticação de usuários do sistema. Suporta diferentes tipos de usuários (aluno, professor, admin) e integra-se com o módulo de Candidatos para alunos que desejam se candidatar.

## Endpoints

### 1. Criar Usuário
```
POST /api/Usuarios/Create
```
- Cria um novo usuário
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

### 2. Login
```
POST /api/Usuarios/Login
```
- Autentica um usuário
- Body (JSON):
```json
{
  "email_institucional": "string",
  "senha": "string"
}
```
- Resposta:
```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "string",
  "usuario": {
    "id": "uuid",
    "nome": "string",
    "email_institucional": "string",
    "tipo_usuario": "string",
    "foto": "string"
  }
}
```

### 3. Buscar Usuário por ID
```
GET /api/Usuarios/Get_id?id=uuid
```
- Retorna os detalhes de um usuário específico
- Parâmetros:
  - id (obrigatório): UUID do usuário
- Resposta:
```json
{
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

### 4. Atualizar Usuário
```
PUT /api/Usuarios/Update?id=uuid
```
- Atualiza os dados de um usuário
- Parâmetros:
  - id (obrigatório): UUID do usuário
- Body (form-data): Mesmos campos da criação, mas todos opcionais
- Resposta: Mesmo formato da criação

### 5. Deletar Usuário
```
DELETE /api/Usuarios/Delete?id=uuid
```
- Marca um usuário como inativo
- Parâmetros:
  - id (obrigatório): UUID do usuário
- Resposta:
```json
{
  "mensagem": "Usuário deletado com sucesso"
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
  foto TEXT,
  ativo INTEGER DEFAULT 1
);
```

### Tabela Candidato (para alunos)
```sql
CREATE TABLE Candidato (
  id TEXT PRIMARY KEY,
  ra TEXT NOT NULL,
  turma TEXT NOT NULL,
  curso TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  qr_code TEXT,
  FOREIGN KEY (id) REFERENCES Usuario(id_usuario)
);
```

## Observações
- Todos os endpoints retornam status 200 em caso de sucesso
- Em caso de erro, retornam status 400, 401, 404 ou 500 com mensagem de erro
- O email institucional deve ser único e seguir o formato @fatec.sp.gov.br
- A senha é armazenada com hash bcrypt
- As fotos são salvas em `public/imgs/usuarios/`
- Apenas usuários ativos podem fazer login
- Alunos podem se tornar candidatos após a aprovação 