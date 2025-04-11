# Documentação da API

## Endpoints

### Candidatos

#### Listar Candidatos
```http
GET /api/Candidatos/Get_all
```

**Resposta**
```json
[
  {
    "id_candidato": 1,
    "ra": "123456",
    "turma_atual": "DSM-1A",
    "deseja_ser_candidato": true,
    "descricao_campanha": "Descrição da campanha",
    "id_usuario": 1,
    "nome": "Nome do Candidato",
    "email_institucional": "email@fatec.sp.gov.br",
    "telefone": "11999999999",
    "foto": "/imgs/candidatos/foto.jpg",
    "tipo_usuario": "aluno"
  }
]
```

#### Buscar Candidato
```http
GET /api/Candidatos/Get_id?id_candidato=1
```

**Parâmetros**
- id_candidato (obrigatório): ID do candidato

**Resposta**
```json
{
  "id_candidato": 1,
  "ra": "123456",
  "turma_atual": "DSM-1A",
  "deseja_ser_candidato": true,
  "descricao_campanha": "Descrição da campanha",
  "id_usuario": 1,
  "nome": "Nome do Candidato",
  "email_institucional": "email@fatec.sp.gov.br",
  "telefone": "11999999999",
  "foto": "/imgs/candidatos/foto.jpg",
  "tipo_usuario": "aluno"
}
```

#### Criar Candidato
```http
POST /api/Candidatos/Create
```

**Body (form-data)**
- ra: RA do aluno
- nome: Nome completo
- email_institucional: Email institucional (@fatec.sp.gov.br)
- telefone: Telefone de contato
- senha: Senha de acesso
- turma_atual: Turma atual
- deseja_ser_candidato: true/false
- descricao_campanha: Descrição da campanha
- foto: Arquivo de imagem

**Resposta**
```json
{
  "mensagem": "Candidato registrado com sucesso!",
  "dados": {
    "ra": "123456",
    "nome": "Nome do Candidato",
    "email": "email@fatec.sp.gov.br"
  }
}
```

#### Atualizar Candidato
```http
PUT /api/Candidatos/Update
```

**Body (form-data)**
- id_candidato: ID do candidato
- id_usuario: ID do usuário
- ra: RA do aluno
- nome: Nome completo
- email_institucional: Email institucional
- telefone: Telefone de contato
- senha: Nova senha (opcional)
- turma_atual: Turma atual
- deseja_ser_candidato: true/false
- descricao_campanha: Descrição da campanha
- foto: Nova foto (opcional)

**Resposta**
```json
{
  "mensagem": "Candidato atualizado com sucesso!",
  "dados": {
    "id_candidato": 1,
    "nome": "Nome do Candidato",
    "email": "email@fatec.sp.gov.br"
  }
}
```

#### Excluir Candidato
```http
DELETE /api/Candidatos/Delete?id_candidato=1
```

**Parâmetros**
- id_candidato (obrigatório): ID do candidato

**Resposta**
```json
{
  "mensagem": "Candidato excluído com sucesso"
}
```

#### Aprovar/Reprovar Candidato
```http
PUT /api/Candidatos/Aprovar
```

**Body**
```json
{
  "id_candidato": 1,
  "acao": "aprovar" // ou "reprovar"
}
```

**Resposta (aprovação)**
```json
{
  "mensagem": "Candidato aprovado e adicionado ao evento com sucesso",
  "dados": {
    "id_candidato": 1,
    "id_evento": 1,
    "nome_evento": "Nome do Evento",
    "url_votacao": "/votacao/interna/confirmacao/1/1"
  }
}
```

**Resposta (reprovação)**
```json
{
  "mensagem": "Candidato reprovado com sucesso",
  "dados": {
    "id_candidato": 1
  }
}
```

### Eventos

#### Listar Eventos
```http
GET /api/Eventos/Get_all
```

**Resposta**
```json
[
  {
    "id_evento": 1,
    "nome_evento": "Nome do Evento",
    "tipo_evento": "Tipo do Evento",
    "descricao": "Descrição do evento",
    "data_inicio": "2024-01-01",
    "data_fim": "2024-01-31",
    "ativo": true,
    "total_projetos": 5,
    "total_candidatos": 3
  }
]
```

#### Buscar Evento
```http
GET /api/Eventos/Get_id?id_evento=1
```

**Parâmetros**
- id_evento (obrigatório): ID do evento

**Resposta**
```json
{
  "evento": {
    "id_evento": 1,
    "nome_evento": "Nome do Evento",
    "tipo_evento": "Tipo do Evento",
    "descricao": "Descrição do evento",
    "data_inicio": "2024-01-01",
    "data_fim": "2024-01-31",
    "ativo": true
  },
  "projetos": [
    {
      "id_projeto": 1,
      "nome_projeto": "Nome do Projeto",
      "url_votacao": "/votacao/publica/confirmacao/1/1"
    }
  ],
  "candidatos": [
    {
      "id_candidato": 1,
      "nome": "Nome do Candidato",
      "url_votacao": "/votacao/interna/confirmacao/1/1"
    }
  ]
}
```

#### Criar Evento
```http
POST /api/Eventos/Create
```

**Body**
```json
{
  "nome_evento": "Nome do Evento",
  "tipo_evento": "Tipo do Evento",
  "descricao": "Descrição do evento",
  "data_inicio": "2024-01-01",
  "data_fim": "2024-01-31",
  "ativo": true
}
```

**Resposta**
```json
{
  "mensagem": "Evento criado com sucesso",
  "id_evento": 1
}
```

#### Atualizar Evento
```http
PUT /api/Eventos/Update
```

**Body**
```json
{
  "id_evento": 1,
  "nome_evento": "Nome do Evento",
  "tipo_evento": "Tipo do Evento",
  "descricao": "Descrição do evento",
  "data_inicio": "2024-01-01",
  "data_fim": "2024-01-31",
  "ativo": true
}
```

**Resposta**
```json
{
  "mensagem": "Evento atualizado com sucesso"
}
```

#### Excluir Evento
```http
DELETE /api/Eventos/Delete?id_evento=1
```

**Parâmetros**
- id_evento (obrigatório): ID do evento

**Resposta**
```json
{
  "mensagem": "Evento excluído com sucesso"
}
```

#### Adicionar Projeto ao Evento
```http
POST /api/Eventos/Add_Project
```

**Body**
```json
{
  "id_evento": 1,
  "id_projeto": 1
}
```

**Resposta**
```json
{
  "mensagem": "Projeto adicionado ao evento com sucesso",
  "url_votacao": "/votacao/publica/confirmacao/1/1"
}
```

#### Adicionar Candidato ao Evento
```http
POST /api/Eventos/Add_Candidato
```

**Body**
```json
{
  "id_evento": 1,
  "id_candidato": 1
}
```

**Resposta**
```json
{
  "mensagem": "Candidato adicionado ao evento com sucesso",
  "url_votacao": "/votacao/interna/confirmacao/1/1"
}
```

### Projetos

#### Listar Projetos
```http
GET /api/Projetos/Get_all
```

**Resposta**
```json
[
  {
    "id_projeto": 1,
    "nome_projeto": "Nome do Projeto",
    "descricao": "Descrição do projeto",
    "area": "Área do projeto",
    "status": "Status do projeto",
    "foto": "/imgs/projetos/foto.jpg"
  }
]
```

#### Buscar Projeto
```http
GET /api/Projetos/Get_id?id_projeto=1
```

**Parâmetros**
- id_projeto (obrigatório): ID do projeto

**Resposta**
```json
{
  "id_projeto": 1,
  "nome_projeto": "Nome do Projeto",
  "descricao": "Descrição do projeto",
  "area": "Área do projeto",
  "status": "Status do projeto",
  "foto": "/imgs/projetos/foto.jpg"
}
```

#### Criar Projeto
```http
POST /api/Projetos/Create
```

**Body (form-data)**
- nome_projeto: Nome do projeto
- descricao: Descrição do projeto
- area: Área do projeto
- status: Status do projeto
- foto: Arquivo de imagem

**Resposta**
```json
{
  "mensagem": "Projeto criado com sucesso",
  "id_projeto": 1
}
```

#### Atualizar Projeto
```http
PUT /api/Projetos/Update
```

**Body (form-data)**
- id_projeto: ID do projeto
- nome_projeto: Nome do projeto
- descricao: Descrição do projeto
- area: Área do projeto
- status: Status do projeto
- foto: Nova foto (opcional)

**Resposta**
```json
{
  "mensagem": "Projeto atualizado com sucesso"
}
```

#### Excluir Projeto
```http
DELETE /api/Projetos/Delete?id_projeto=1
```

**Parâmetros**
- id_projeto (obrigatório): ID do projeto

**Resposta**
```json
{
  "mensagem": "Projeto excluído com sucesso"
}
```

## Códigos de Resposta

- 200: Sucesso
- 201: Criado com sucesso
- 400: Requisição inválida
- 401: Não autorizado
- 404: Recurso não encontrado
- 405: Método não permitido
- 409: Conflito
- 500: Erro interno do servidor

## Observações

- Todas as rotas estão protegidas por autenticação (comentada no momento)
- As URLs de votação são geradas automaticamente ao adicionar projetos ou candidatos a eventos
- As fotos são armazenadas no diretório public/imgs
- As senhas são armazenadas com hash
- Todas as operações críticas são realizadas dentro de transações 