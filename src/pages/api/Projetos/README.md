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

## Estrutura das Tabelas

### Tabela Projetos
```sql
CREATE TABLE "Projetos" (
  id_projeto SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  id_aluno INTEGER NOT NULL REFERENCES "Alunos"(id_aluno),
  data_criacao TIMESTAMP DEFAULT now(),
  data_alteracao TIMESTAMP DEFAULT now()
);
```

### Tabela ImagensProjeto
```sql
CREATE TABLE "ImagensProjeto" (
  id_imagem SERIAL PRIMARY KEY,
  id_projeto INTEGER NOT NULL REFERENCES "Projetos"(id_projeto),
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  data_criacao TIMESTAMP DEFAULT now(),
  data_alteracao TIMESTAMP DEFAULT now()
);
```

### Tabela AvaliacoesProjeto
```sql
CREATE TABLE "AvaliacoesProjeto" (
  id_avaliacao SERIAL PRIMARY KEY,
  id_projeto INTEGER NOT NULL REFERENCES "Projetos"(id_projeto),
  id_avaliador INTEGER NOT NULL REFERENCES "Usuarios"(id_usuario),
  nota DECIMAL(3,1) NOT NULL CHECK (nota >= 0 AND nota <= 10),
  comentario TEXT,
  data_avaliacao TIMESTAMP DEFAULT now(),
  data_alteracao TIMESTAMP DEFAULT now()
);
```

## Observações
1. Um projeto deve estar associado a um aluno existente
2. As imagens de um projeto são ordenadas pelo campo `ordem`
3. As avaliações são feitas por usuários do sistema
4. A nota da avaliação deve estar entre 0 e 10
5. Um avaliador pode atualizar sua avaliação a qualquer momento
6. Todas as operações são realizadas dentro de transações para garantir a integridade dos dados
7. O sistema mantém histórico de alterações através dos campos `data_criacao` e `data_alteracao`
8. Em ambiente de desenvolvimento, mensagens de erro detalhadas são retornadas
9. Validações são realizadas antes de cada operação para garantir a consistência dos dados
10. As conexões com o banco de dados são sempre fechadas após o uso
11. Ao atualizar um projeto, as imagens antigas são removidas e as novas são inseridas 