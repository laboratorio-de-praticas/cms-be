# Documentação da API LP-CMS

## Visão Geral

A API do LP-CMS é uma API RESTful que permite o gerenciamento de projetos, eventos, alunos e avaliações. Todos os endpoints retornam respostas em formato JSON.

## Autenticação

A maioria dos endpoints requer autenticação via JWT. O token deve ser enviado no header da requisição:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Projetos

#### 1.1 Criar Projeto
`POST /api/Projetos/Create`

Cria um novo projeto com todas as suas relações.

**Body:**
```json
{
  "titulo": "string",
  "nome_equipe": "string",
  "descricao": "string",
  "foto_url": "string",
  "tlr": boolean,
  "cea": boolean,
  "turma": "string",
  "imagens": [
    {
      "imagem_url": "string"
    }
  ],
  "integrantes": [
    {
      "aluno_id": number
    }
  ],
  "ods": [number],
  "linhas_extensao": [number],
  "categorias": [number]
}
```

#### 1.2 Atualizar Projeto
`PUT /api/Projetos/Update?id_projeto={id}`

Atualiza um projeto existente. Permite atualização parcial.

**Parâmetros:**
- `id_projeto` (query): ID do projeto

**Body (opcional):**
```json
{
  "titulo": "string",
  "nome_equipe": "string",
  "descricao": "string",
  "foto_url": "string",
  "tlr": boolean,
  "cea": boolean,
  "turma": "string",
  "ativo": boolean,
  "imagens": [
    {
      "imagem_url": "string"
    }
  ],
  "integrantes": [
    {
      "aluno_id": number
    }
  ],
  "ods": [number],
  "linhas_extensao": [number],
  "categorias": [number]
}
```

#### 1.3 Obter Todos os Projetos
`GET /api/Projetos/Get_all`

Retorna todos os projetos cadastrados.

#### 1.4 Obter Projetos Ativos
`GET /api/Projetos/Get_active`

Retorna apenas os projetos ativos.

#### 1.5 Obter Projeto por ID
`GET /api/Projetos/Get_id?id_projeto={id}`

Retorna um projeto específico.

**Parâmetros:**
- `id_projeto` (query): ID do projeto

#### 1.6 Obter Projetos por Turma
`GET /api/Projetos/Get_turma?turma={turma}`

Retorna projetos de uma turma específica.

**Parâmetros:**
- `turma` (query): Nome da turma

#### 1.7 Obter Projetos por Aluno
`GET /api/Projetos/Get_aluno?id_aluno={id}`

Retorna projetos de um aluno específico.

**Parâmetros:**
- `id_aluno` (query): ID do aluno

#### 1.8 Desativar Projeto
`PUT /api/Projetos/Disable?id_projeto={id}`

Desativa um projeto.

**Parâmetros:**
- `id_projeto` (query): ID do projeto

### 2. Eventos

#### 2.1 Criar Evento
`POST /api/Eventos/Create`

Cria um novo evento.

**Body:**
```json
{
  "nome_evento": "string",
  "tipo_evento": "string",
  "descricao": "string",
  "data_inicio": "string",
  "data_fim": "string",
  "ativo": boolean
}
```

#### 2.2 Atualizar Evento
`PUT /api/Eventos/Update?id_evento={id}`

Atualiza um evento existente.

**Parâmetros:**
- `id_evento` (query): ID do evento

**Body:**
```json
{
  "nome_evento": "string",
  "tipo_evento": "string",
  "descricao": "string",
  "data_inicio": "string",
  "data_fim": "string",
  "ativo": boolean
}
```

#### 2.3 Obter Todos os Eventos
`GET /api/Eventos/Get_all`

Retorna todos os eventos.

#### 2.4 Obter Evento por ID
`GET /api/Eventos/Get_id?id_evento={id}`

Retorna um evento específico.

**Parâmetros:**
- `id_evento` (query): ID do evento

#### 2.5 Adicionar Projeto ao Evento
`POST /api/Eventos/Add_Project`

Adiciona um projeto a um evento.

**Body:**
```json
{
  "id_evento": number,
  "id_projeto": number
}
```

### 3. Alunos

#### 3.1 Criar Aluno
`POST /api/Alunos/Create`

Cria um novo aluno.

**Body:**
```json
{
  "ra": "string",
  "nome": "string",
  "email_institucional": "string",
  "telefone": "string",
  "turma": "string"
}
```

#### 3.2 Atualizar Aluno
`PUT /api/Alunos/Update?id_aluno={id}`

Atualiza um aluno existente.

**Parâmetros:**
- `id_aluno` (query): ID do aluno

**Body:**
```json
{
  "ra": "string",
  "nome": "string",
  "email_institucional": "string",
  "telefone": "string",
  "turma": "string"
}
```

#### 3.3 Obter Todos os Alunos
`GET /api/Alunos/Get_all`

Retorna todos os alunos.

#### 3.4 Obter Aluno por ID
`GET /api/Alunos/Get_id?id_aluno={id}`

Retorna um aluno específico.

**Parâmetros:**
- `id_aluno` (query): ID do aluno

### 4. Avaliações

#### 4.1 Criar Avaliação
`POST /api/Avaliacoes/Create`

Cria uma nova avaliação.

**Body:**
```json
{
  "id_projeto": number,
  "id_avaliador": number,
  "nota": number,
  "comentario": "string"
}
```

#### 4.2 Atualizar Avaliação
`PUT /api/Avaliacoes/Update?id_avaliacao={id}`

Atualiza uma avaliação existente.

**Parâmetros:**
- `id_avaliacao` (query): ID da avaliação

**Body:**
```json
{
  "nota": number,
  "comentario": "string"
}
```

#### 4.3 Obter Avaliações do Projeto
`GET /api/Avaliacoes/Get_projeto?id_projeto={id}`

Retorna todas as avaliações de um projeto.

**Parâmetros:**
- `id_projeto` (query): ID do projeto

## Respostas de Erro

A API retorna os seguintes códigos de status HTTP:

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autorizado
- `403`: Proibido
- `404`: Não encontrado
- `500`: Erro interno do servidor

Exemplo de resposta de erro:
```json
{
  "mensagem": "Erro ao processar requisição",
  "erro": "Mensagem detalhada do erro (apenas em desenvolvimento)"
}
```

## Paginação

Endpoints que retornam múltiplos itens suportam paginação através dos parâmetros:

- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)

Exemplo:
```
GET /api/Projetos/Get_all?page=2&limit=20
```

Resposta paginada:
```json
{
  "mensagem": "Projetos encontrados com sucesso",
  "total": 100,
  "pagina_atual": 2,
  "total_paginas": 5,
  "dados": [
    // Array de projetos
  ]
}
```

## Ordenação

Alguns endpoints suportam ordenação através do parâmetro `sort`:

```
GET /api/Projetos/Get_all?sort=data_criacao:desc
```

## Filtros

Endpoints que retornam múltiplos itens suportam filtros:

```
GET /api/Projetos/Get_all?turma=3A&ativo=true
```

## Observações

1. Todos os endpoints retornam mensagens de erro detalhadas em ambiente de desenvolvimento
2. As atualizações são feitas em transação, garantindo a integridade dos dados
3. Relacionamentos são atualizados completamente quando enviados
4. Campos não enviados em atualizações parciais mantêm seus valores originais
5. A data de alteração é atualizada automaticamente em todas as modificações 