# Módulo de Eventos

## Visão Geral
O módulo de Eventos gerencia a criação e administração de eventos, permitindo a inscrição de projetos e candidatos. Cada evento possui datas de início e fim, local, e pode ter múltiplos projetos e candidatos associados.

## Endpoints

### 1. Listar Todos os Eventos
```
GET /api/Eventos/List
```
- Retorna todos os eventos ativos
- Inclui contagem de projetos e candidatos
- Resposta:
```json
{
  "eventos": [
    {
      "id_evento": "uuid",
      "nome_evento": "string",
      "descricao": "string",
      "data_inicio": "string",
      "data_fim": "string",
      "local": "string",
      "ativo": boolean,
      "total_projetos": number,
      "total_candidatos": number
    }
  ],
  "total": number
}
```

### 2. Buscar Evento por ID
```
GET /api/Eventos/Get?id=uuid
```
- Retorna os detalhes de um evento específico
- Parâmetros:
  - id (obrigatório): UUID do evento
- Resposta:
```json
{
  "id_evento": "uuid",
  "nome_evento": "string",
  "descricao": "string",
  "data_inicio": "string",
  "data_fim": "string",
  "local": "string",
  "ativo": boolean,
  "projetos": [
    {
      "id_projeto": "uuid",
      "nome_projeto": "string",
      // ... outros campos do projeto
    }
  ],
  "candidatos": [
    {
      "id_candidato": "uuid",
      "nome": "string",
      // ... outros campos do candidato
    }
  ]
}
```

### 3. Criar Evento
```
POST /api/Eventos/Create
```
- Cria um novo evento
- Body (form-data):
  - nome_evento (obrigatório): string
  - descricao (obrigatório): string
  - data_inicio (obrigatório): string (YYYY-MM-DD)
  - data_fim (obrigatório): string (YYYY-MM-DD)
  - local (obrigatório): string
- Resposta:
```json
{
  "mensagem": "Evento criado com sucesso",
  "evento": {
    "id_evento": "uuid",
    "nome_evento": "string",
    "descricao": "string",
    "data_inicio": "string",
    "data_fim": "string",
    "local": "string"
  }
}
```

### 4. Adicionar Projeto ao Evento
```
POST /api/Eventos/Add_Project
```
- Adiciona um projeto a um evento
- Body (JSON):
```json
{
  "id_evento": "uuid",
  "id_projeto": "uuid"
}
```
- Resposta:
```json
{
  "mensagem": "Projeto adicionado ao evento com sucesso",
  "dados": {
    "id_evento": "uuid",
    "id_projeto": "uuid",
    "url_confirmacao": "string"
  }
}
```

### 5. Adicionar Candidato ao Evento
```
POST /api/Eventos/Add_Candidate
```
- Adiciona um candidato a um evento
- Body (JSON):
```json
{
  "id_evento": "uuid",
  "id_candidato": "uuid"
}
```
- Resposta:
```json
{
  "mensagem": "Candidato adicionado ao evento com sucesso",
  "dados": {
    "id_evento": "uuid",
    "id_candidato": "uuid",
    "url_confirmacao": "string"
  }
}
```

## Estrutura de Dados

### Tabela Eventos
```sql
CREATE TABLE Eventos (
  id_evento TEXT PRIMARY KEY,
  nome_evento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL,
  local TEXT NOT NULL,
  ativo INTEGER DEFAULT 1
);
```

### Tabelas Relacionadas
- EventoProjeto
- EventoCandidato

## Observações
- Todos os endpoints retornam status 200 em caso de sucesso
- Em caso de erro, retornam status 400, 401, 404 ou 500 com mensagem de erro
- As URLs de confirmação são geradas automaticamente para projetos e candidatos
- A data de início deve ser anterior à data de fim
- Um projeto/candidato não pode ser adicionado duas vezes ao mesmo evento 