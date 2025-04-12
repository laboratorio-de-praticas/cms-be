# API de Usuários

Esta API gerencia os usuários do sistema, incluindo alunos, professores, atendentes e administradores.

## Endpoints

### GET /api/Usuarios/Get_all
Retorna a lista de todos os usuários do sistema.

**Resposta:**
```json
{
  "mensagem": "Usuários listados com sucesso",
  "total": 10,
  "dados": [
    {
      "id": 1,
      "nome": "Nome do Usuário",
      "email_institucional": "email@fatec.sp.gov.br",
      "tipo_usuario": "Admin",
      "status_usuario": "Ativo",
      "telefone": "11999999999",
      "data_criacao": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "nome": "Nome do Aluno",
      "email_institucional": "aluno@fatec.sp.gov.br",
      "tipo_usuario": "Interno",
      "status_usuario": "Ativo",
      "telefone": "11999999999",
      "data_criacao": "2024-01-01T00:00:00.000Z",
      "dados_aluno": {
        "id_aluno": 1,
        "ra": "123456",
        "curso_semestre": "DSM - 2024.1",
        "deseja_ser_candidato": false
      }
    }
  ]
}
```

### GET /api/Usuarios/Get_id?id_usuario={id}
Retorna os dados de um usuário específico.

**Parâmetros:**
- `id_usuario`: ID do usuário a ser buscado

**Resposta:**
```json
{
  "mensagem": "Usuário encontrado com sucesso",
  "dados": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email_institucional": "email@fatec.sp.gov.br",
    "tipo_usuario": "Interno",
    "status_usuario": "Ativo",
    "telefone": "11999999999",
    "data_criacao": "2024-01-01T00:00:00.000Z",
    "dados_aluno": {
      "id_aluno": 1,
      "ra": "123456",
      "curso_semestre": "DSM - 2024.1",
      "deseja_ser_candidato": false
    }
  }
}
```

### POST /api/Usuarios/Create
Cria um novo usuário no sistema.

**Corpo da Requisição:**
```json
{
  "nome": "Nome do Usuário",
  "email_institucional": "email@fatec.sp.gov.br",
  "senha": "Senha@123",
  "tipo_usuario": "Interno",
  "dados_aluno": {
    "ra": "123456",
    "curso_semestre": "DSM - 2024.1",
    "deseja_ser_candidato": false
  }
}
```

**Resposta:**
```json
{
  "mensagem": "Usuário criado com sucesso",
  "dados": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email_institucional": "email@fatec.sp.gov.br",
    "tipo_usuario": "Interno",
    "status_usuario": "Pendente",
    "data_criacao": "2024-01-01T00:00:00.000Z",
    "dados_aluno": {
      "id_aluno": 1,
      "ra": "123456",
      "curso_semestre": "DSM - 2024.1",
      "deseja_ser_candidato": false
    }
  }
}
```

### PUT /api/Usuarios/Update?id={id}
Atualiza os dados de um usuário existente.

**Parâmetros:**
- `id`: ID do usuário a ser atualizado

**Corpo da Requisição:**
```json
{
  "nome": "Novo Nome",
  "email_institucional": "novo.email@fatec.sp.gov.br",
  "telefone": "11999999999",
  "status_usuario": "Ativo",
  "dados_aluno": {
    "ra": "123456",
    "curso_semestre": "DSM - 2024.1",
    "deseja_ser_candidato": true
  }
}
```

**Resposta:**
```json
{
  "mensagem": "Usuário atualizado com sucesso",
  "dados": {
    "id": 1,
    "nome": "Novo Nome",
    "email_institucional": "novo.email@fatec.sp.gov.br",
    "tipo_usuario": "Interno",
    "status_usuario": "Ativo",
    "telefone": "11999999999",
    "data_criacao": "2024-01-01T00:00:00.000Z",
    "dados_aluno": {
      "id_aluno": 1,
      "ra": "123456",
      "curso_semestre": "DSM - 2024.1",
      "deseja_ser_candidato": true
    }
  }
}
```

## Tipos de Usuário
- `Interno`: Aluno da instituição
- `Admin`: Administrador do sistema
- `Atendente`: Atendente da instituição
- `Professor`: Professor da instituição

## Status do Usuário
- `Pendente`: Usuário recém-criado, aguardando aprovação
- `Ativo`: Usuário ativo no sistema
- `Desligado`: Usuário desligado do sistema

## Observações
1. O campo `email_institucional` deve ser único no sistema
2. Para usuários do tipo "Interno", o campo `ra` também deve ser único
3. A senha é armazenada de forma hasheada no banco de dados
4. O campo `telefone` é opcional
5. O campo `status_usuario` é definido automaticamente como "Pendente" no momento da criação
6. Para usuários do tipo "Interno", o campo `curso_semestre` deve seguir o formato "Curso - Semestre" (ex: "DSM - 2024.1") 