# API de Projetos

Esta API gerencia os projetos do sistema, permitindo operações CRUD completas e relacionamentos com outras entidades.

## Endpoints

### 1. Criar Projeto
`POST /api/Projetos/Create`

Cria um novo projeto com todas as suas relações.

**Parâmetros (Body):**
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

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projeto criado com sucesso",
  "dados": {
    "id_projeto": number,
    "titulo": "string",
    "nome_equipe": "string",
    "descricao": "string",
    "foto_url": "string",
    "tlr": boolean,
    "cea": boolean,
    "turma": "string",
    "ativo": boolean,
    "data_criacao": "timestamp",
    "data_alteracao": "timestamp",
    "imagens": [
      {
        "id_imagem": number,
        "imagem_url": "string"
      }
    ],
    "ods": [
      {
        "id_ods": number,
        "descricao": "string"
      }
    ],
    "linhas_extensao": [
      {
        "id_linha": number,
        "descricao": "string"
      }
    ],
    "categorias": [
      {
        "id_categoria": number,
        "nome": "string",
        "descricao": "string"
      }
    ],
    "integrantes": [
      {
        "id_integrante": number,
        "id_aluno": number,
        "nome": "string"
      }
    ]
  }
}
```

### 2. Atualizar Projeto
`PUT /api/Projetos/Update?id_projeto={id}`

Atualiza um projeto existente. Permite atualização parcial (apenas os campos enviados serão atualizados).

**Parâmetros:**
- `id_projeto` (query): ID do projeto a ser atualizado

**Body (opcional - apenas os campos que deseja atualizar):**
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

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projeto atualizado com sucesso",
  "dados": {
    // Mesma estrutura da resposta de criação
  }
}
```

### 3. Obter Todos os Projetos
`GET /api/Projetos/Get_all`

Retorna todos os projetos cadastrados.

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projetos encontrados com sucesso",
  "total": number,
  "dados": [
    {
      // Estrutura completa do projeto
    }
  ]
}
```

### 4. Obter Projetos Ativos
`GET /api/Projetos/Get_active`

Retorna apenas os projetos ativos.

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projetos ativos encontrados com sucesso",
  "total": number,
  "dados": [
    {
      // Estrutura completa do projeto
    }
  ]
}
```

### 5. Obter Projeto por ID
`GET /api/Projetos/Get_id?id_projeto={id}`

Retorna um projeto específico pelo seu ID.

**Parâmetros:**
- `id_projeto` (query): ID do projeto desejado

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projeto encontrado com sucesso",
  "dados": {
    // Estrutura completa do projeto
  }
}
```

### 6. Obter Projetos por Turma
`GET /api/Projetos/Get_turma?turma={turma}`

Retorna todos os projetos de uma turma específica.

**Parâmetros:**
- `turma` (query): Nome da turma

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projetos da turma encontrados com sucesso",
  "total": number,
  "dados": [
    {
      // Estrutura completa do projeto
    }
  ]
}
```

### 7. Obter Projetos por Aluno
`GET /api/Projetos/Get_aluno?id_aluno={id}`

Retorna todos os projetos de um aluno específico.

**Parâmetros:**
- `id_aluno` (query): ID do aluno

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projetos do aluno encontrados com sucesso",
  "total": number,
  "dados": [
    {
      // Estrutura completa do projeto
    }
  ]
}
```

### 8. Desativar Projeto
`PUT /api/Projetos/Disable?id_projeto={id}`

Desativa um projeto específico.

**Parâmetros:**
- `id_projeto` (query): ID do projeto a ser desativado

**Resposta de Sucesso:**
```json
{
  "mensagem": "Projeto desativado com sucesso"
}
```

### 9. Get ODS
Retorna todos os ODS cadastrados no sistema.

**Requisição:**
```http
GET /api/Projetos/Get_ods
```

**Resposta:**
```json
[
    {
        "id_ods": 1,
        "descricao": "Erradicação da Pobreza"
    },
    {
        "id_ods": 2,
        "descricao": "Fome Zero e Agricultura Sustentável"
    }
]
```

### 10. Get Linhas de Extensão
Retorna todas as linhas de extensão cadastradas no sistema.

**Requisição:**
```http
GET /api/Projetos/Get_linhas_extensao
```

**Resposta:**
```json
[
    {
        "id_linha": 1,
        "descricao": "Educação e Cultura"
    },
    {
        "id_linha": 2,
        "descricao": "Tecnologia e Inovação"
    }
]
```

### 11. Get Nome de Alunos
Busca alunos pelo nome, retornando dados tanto da tabela de Alunos quanto de Usuários.

**Requisição:**
```http
GET /api/Projetos/Get_nome_alunos?nome=joao
```

**Parâmetros:**
- `nome` (obrigatório): Termo para busca no nome do aluno

**Resposta:**
```json
[
    {
        "id_aluno": 1,
        "foto_url": "https://exemplo.com/foto.jpg",
        "curso_semestre": "Engenharia - 4º Semestre",
        "ra": 123456,
        "data_matricula": "2023-01-15T00:00:00.000Z",
        "nome": "João Silva",
        "telefone": "(11) 99999-9999",
        "email_institucional": "joao.silva@fatec.sp.gov.br",
        "tipo_usuario": "Interno",
        "status_usuario": "Ativo"
    }
]
```

### 12. Get Nome de Projeto
Busca projetos pelo título.

**Requisição:**
```http
GET /api/Projetos/Get_nome_Projeto?nome=projeto
```

**Parâmetros:**
- `nome` (obrigatório): Termo para busca no título do projeto

**Resposta:**
```json
[
    {
        "id_projeto": 1,
        "titulo": "Projeto de Inovação",
        "nome_equipe": "Equipe Alpha",
        "descricao": "Descrição do projeto...",
        "foto_url": "https://exemplo.com/projeto.jpg",
        "tlr": 100,
        "cea": 200,
        "turma": "DSM-4A",
        "ativo": true,
        "data_criacao": "2023-01-15T00:00:00.000Z",
        "data_alteracao": "2023-01-15T00:00:00.000Z"
    }
]
```

## Códigos de Status

- `200`: Sucesso
- `400`: Requisição inválida (dados faltando ou inválidos)
- `404`: Projeto não encontrado
- `405`: Método não permitido
- `500`: Erro interno do servidor

## Observações

1. Todos os endpoints retornam mensagens de erro detalhadas em ambiente de desenvolvimento
2. As atualizações são feitas em transação, garantindo a integridade dos dados
3. Relacionamentos (imagens, integrantes, ODS, etc.) são atualizados completamente quando enviados
4. Campos não enviados em atualizações parciais mantêm seus valores originais
5. A data de alteração é atualizada automaticamente em todas as modificações
6. As buscas por nome (alunos e projetos) são case-insensitive
7. Os endpoints de busca retornam resultados ordenados por nome/título