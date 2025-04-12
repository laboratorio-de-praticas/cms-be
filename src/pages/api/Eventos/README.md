# Módulo de Eventos

## Visão Geral
O módulo de Eventos gerencia todos os eventos acadêmicos, incluindo eleições de representantes de turma e feiras de projetos. Permite a criação, atualização e gerenciamento de eventos, além da associação com projetos e representantes.

## Endpoints

### Criar Evento
```http
POST /api/Eventos/Create
Content-Type: application/json

{
  "tipo_evento": "Interno",
  "nome_evento": "Eleição de Representantes",
  "descricao_evento": "Eleição para escolher os representantes de turma",
  "status_evento": "Ativo",
  "curso_semestre": "DSM",
  "ano_semestre": "2024.1",
  "data_inicio": "2024-01-01T00:00:00Z",
  "data_fim": "2024-01-31T23:59:59Z"
}
```

### Listar Todos os Eventos
```http
GET /api/Eventos/Get_all
```

### Buscar Evento por ID
```http
GET /api/Eventos/Get_id?id_evento=1
```

### Atualizar Evento
```http
PUT /api/Eventos/Update?id_evento=1
Content-Type: application/json

{
  "tipo_evento": "Interno",
  "nome_evento": "Novo Nome do Evento",
  "descricao_evento": "Nova descrição do evento",
  "status_evento": "Ativo",
  "curso_semestre": "DSM",
  "ano_semestre": "2024.1",
  "data_inicio": "2024-01-01T00:00:00Z",
  "data_fim": "2024-01-31T23:59:59Z"
}
```

### Adicionar Projeto ao Evento
```http
POST /api/Eventos/Add_Project
Content-Type: application/json

{
  "fk_id_evento": 1,
  "fk_id_projeto": 1
}
```

### Adicionar Representante ao Evento
```http
POST /api/Eventos/Add_Representantes
Content-Type: application/json

{
  "fk_id_evento": 1,
  "fk_id_aluno": 1,
  "descricao_campanha": "Minha campanha para representante de turma"
}
```

## Respostas

### Sucesso (201 Created)
```json
{
  "mensagem": "Evento criado com sucesso",
  "id_evento": 1
}
```

### Erro (400 Bad Request)
```json
{
  "mensagem": "Campos obrigatórios não fornecidos",
  "dados_recebidos": {
    "nome_evento": "Eleição"
  }
}
```

### Erro (404 Not Found)
```json
{
  "mensagem": "Evento não encontrado"
}
```

### Erro (500 Internal Server Error)
```json
{
  "mensagem": "Erro ao criar evento",
  "detalhes": "Mensagem de erro específica"
}
```

## Regras de Negócio

### Validações
- Todos os endpoints são protegidos por autenticação
- O campo `tipo_evento` deve ser um dos valores: "Interno" ou "Externo"
- O campo `status_evento` deve ser um dos valores: "Ativo", "Em_Preparo", "Em_Contagem" ou "Finalizado"
- Os campos `data_inicio` e `data_fim` devem estar no formato ISO 8601
- `data_fim` deve ser posterior a `data_inicio`

### Representantes
- Um aluno só pode ser representante em um novo evento se estiver com status "Desligado" no evento anterior
- Ao adicionar um representante, o sistema verifica se o aluno já é representante em outro evento
- Um aluno não pode ser representante em mais de um evento simultaneamente

### Projetos
- Um projeto pode ser associado a múltiplos eventos
- A associação entre projeto e evento é única (não pode haver duplicatas)

## Estrutura do Banco de Dados

### Tabela Eventos
```sql
CREATE TABLE "Eventos" (
  "id_evento" SERIAL PRIMARY KEY,
  "tipo_evento" VARCHAR(50) NOT NULL,
  "nome_evento" VARCHAR(100) NOT NULL,
  "descricao_evento" TEXT,
  "status_evento" VARCHAR(50) NOT NULL,
  "curso_semestre" VARCHAR(50),
  "ano_semestre" VARCHAR(10),
  "data_inicio" TIMESTAMP NOT NULL,
  "data_fim" TIMESTAMP NOT NULL,
  "data_criacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "data_alteracao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela ProjetosEventos
```sql
CREATE TABLE "ProjetosEventos" (
  "fk_id_evento" INTEGER REFERENCES "Eventos"("id_evento"),
  "fk_id_projeto" INTEGER REFERENCES "Projetos"("id_projeto"),
  PRIMARY KEY ("fk_id_evento", "fk_id_projeto")
);
```

### Tabela Representantes
```sql
CREATE TABLE "Representantes" (
  "id_representante" SERIAL PRIMARY KEY,
  "fk_id_evento" INTEGER REFERENCES "Eventos"("id_evento"),
  "fk_id_aluno" INTEGER REFERENCES "Alunos"("id_aluno"),
  "descricao_campanha" TEXT,
  "RepresentanteSituacao" VARCHAR(50) DEFAULT 'Pendente',
  "data_criacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "data_alteracao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("fk_id_evento", "fk_id_aluno")
);
```

## Exemplos de Uso

### Criando um Evento de Eleição
```javascript
const evento = {
  tipo_evento: "Interno",
  nome_evento: "Eleição de Representantes DSM 2024.1",
  descricao_evento: "Eleição para escolher os representantes da turma DSM 2024.1",
  status_evento: "Ativo",
  curso_semestre: "DSM",
  ano_semestre: "2024.1",
  data_inicio: "2024-01-01T00:00:00Z",
  data_fim: "2024-01-31T23:59:59Z"
};
```

### Adicionando um Representante
```javascript
const representante = {
  fk_id_evento: 1,
  fk_id_aluno: 1,
  descricao_campanha: "Comprometido com a representação da turma e melhoria do ambiente acadêmico"
};
```

## Observações Importantes
1. Todas as operações são realizadas dentro de transações para garantir a integridade dos dados
2. As datas devem ser fornecidas no formato ISO 8601
3. O sistema mantém histórico de alterações através dos campos `data_criacao` e `data_alteracao`
4. As validações de negócio são aplicadas antes de qualquer operação no banco de dados 