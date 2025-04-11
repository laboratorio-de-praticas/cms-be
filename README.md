# CMS - Sistema de Gerenciamento de Eventos

Sistema de gerenciamento de eventos acadêmicos com funcionalidades para projetos e candidatos.

## Estrutura do Projeto

```
src/
├── pages/
│   └── api/
│       ├── Candidatos/
│       │   ├── Aprovar/
│       │   ├── Create/
│       │   ├── Delete/
│       │   ├── Get_all/
│       │   ├── Get_id/
│       │   └── Update/
│       ├── Eventos/
│       │   ├── Add_Candidato/
│       │   ├── Add_Project/
│       │   ├── Create/
│       │   ├── Delete/
│       │   ├── Get_all/
│       │   ├── Get_id/
│       │   └── Update/
│       └── Projetos/
│           ├── Create/
│           ├── Delete/
│           ├── Get_all/
│           ├── Get_id/
│           └── Update/
├── config/
│   └── database.js
└── middleware/
    └── authMiddleware.js
```

## Rotas da API

### Candidatos

#### GET /api/Candidatos/Get_all
- Lista todos os candidatos
- Retorna: Array de candidatos com seus dados

#### GET /api/Candidatos/Get_id?id_candidato={id}
- Busca um candidato específico
- Parâmetros:
  - id_candidato: ID do candidato
- Retorna: Dados do candidato

#### POST /api/Candidatos/Create
- Cria um novo candidato
- Body:
  ```json
  {
    "ra": "string",
    "nome": "string",
    "email_institucional": "string",
    "telefone": "string",
    "senha": "string",
    "turma_atual": "string",
    "deseja_ser_candidato": boolean,
    "descricao_campanha": "string",
    "foto": "file"
  }
  ```

#### PUT /api/Candidatos/Update
- Atualiza um candidato existente
- Body:
  ```json
  {
    "id_candidato": number,
    "id_usuario": number,
    "ra": "string",
    "nome": "string",
    "email_institucional": "string",
    "telefone": "string",
    "senha": "string",
    "turma_atual": "string",
    "deseja_ser_candidato": boolean,
    "descricao_campanha": "string",
    "foto": "file"
  }
  ```

#### DELETE /api/Candidatos/Delete?id_candidato={id}
- Remove um candidato
- Parâmetros:
  - id_candidato: ID do candidato

#### PUT /api/Candidatos/Aprovar
- Aprova ou reprova um candidato
- Body:
  ```json
  {
    "id_candidato": number,
    "acao": "aprovar" | "reprovar"
  }
  ```

### Eventos

#### GET /api/Eventos/Get_all
- Lista todos os eventos
- Retorna: Array de eventos com seus dados

#### GET /api/Eventos/Get_id?id_evento={id}
- Busca um evento específico
- Parâmetros:
  - id_evento: ID do evento
- Retorna: Dados do evento, projetos e candidatos associados

#### POST /api/Eventos/Create
- Cria um novo evento
- Body:
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

#### PUT /api/Eventos/Update
- Atualiza um evento existente
- Body:
  ```json
  {
    "id_evento": number,
    "nome_evento": "string",
    "tipo_evento": "string",
    "descricao": "string",
    "data_inicio": "string",
    "data_fim": "string",
    "ativo": boolean
  }
  ```

#### DELETE /api/Eventos/Delete?id_evento={id}
- Remove um evento
- Parâmetros:
  - id_evento: ID do evento

#### POST /api/Eventos/Add_Project
- Adiciona um projeto a um evento
- Body:
  ```json
  {
    "id_evento": number,
    "id_projeto": number
  }
  ```

#### POST /api/Eventos/Add_Candidato
- Adiciona um candidato a um evento
- Body:
  ```json
  {
    "id_evento": number,
    "id_candidato": number
  }
  ```

### Projetos

#### GET /api/Projetos/Get_all
- Lista todos os projetos
- Retorna: Array de projetos com seus dados

#### GET /api/Projetos/Get_id?id_projeto={id}
- Busca um projeto específico
- Parâmetros:
  - id_projeto: ID do projeto
- Retorna: Dados do projeto

#### POST /api/Projetos/Create
- Cria um novo projeto
- Body:
  ```json
  {
    "nome_projeto": "string",
    "descricao": "string",
    "area": "string",
    "status": "string",
    "foto": "file"
  }
  ```

#### PUT /api/Projetos/Update
- Atualiza um projeto existente
- Body:
  ```json
  {
    "id_projeto": number,
    "nome_projeto": "string",
    "descricao": "string",
    "area": "string",
    "status": "string",
    "foto": "file"
  }
  ```

#### DELETE /api/Projetos/Delete?id_projeto={id}
- Remove um projeto
- Parâmetros:
  - id_projeto: ID do projeto

## Estrutura do Banco de Dados

### Tabelas Principais

#### Usuario
- id_usuario (PK)
- nome
- email_institucional
- senha
- tipo_usuario
- foto
- telefone
- ativo

#### Candidato
- id_candidato (PK)
- id_usuario (FK)
- ra
- turma_atual
- deseja_ser_candidato
- descricao_campanha

#### Eventos
- id_evento (PK)
- nome_evento
- tipo_evento
- descricao
- data_inicio
- data_fim
- ativo

#### Projetos
- id_projeto (PK)
- nome_projeto
- descricao
- area
- status
- foto

#### EventoxProjeto
- id_evento (FK)
- id_projeto (FK)
- url_votacao

#### EventoxCandidato
- id_evento (FK)
- id_candidato (FK)
- url_votacao

## Requisitos

- Node.js
- SQLite3
- Dependências listadas no package.json

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados SQLite
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Segurança

- Todas as rotas estão protegidas por autenticação (comentada no momento)
- Senhas são armazenadas com hash
- Validação de dados em todas as entradas
- Transações para operações críticas

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Descrição: ##
O CMS será o sistema de gerenciamento de conteúdo do projeto, permitindo que administradores cadastrem e gerenciem informações sobre candidatos (representantes de turma) e projetos das feiras FTX e HubTec.

## Funcionalidades Principais: (Back-end) ##

- Cadastro de candidatos (representantes de turma) com fotos, informações específicas e relevantes.
- Cadastro de projetos das feiras FTX e HubTec, incluindo título, descrição, equipe responsável e fotos.
- Edição e exclusão de conteúdos cadastrados.
- Interface amigável para administradores, com validação de dados e prevenção de erros.
- Integração com o módulo de Vitrine para exibição dos projetos ao público.


# Documentação do Back-end

## Arquitetura do Sistema

### Tecnologias Utilizadas
- Next.js como framework principal
- SQLite como banco de dados
- API RESTful para comunicação entre frontend e backend
- Sistema de autenticação integrado

### Estrutura de Diretórios
```
src/
├── pages/
│   ├── api/
│   │   ├── Candidatos/
│   │   └── Projetos/
│   ├── projetos/
│   └── index.js
├── database/
├── config/
└── styles/
```

## Módulos Principais

### 1. Módulo de Candidatos
- Gerenciamento de representantes de turma
- Cadastro e edição de informações pessoais
- Upload e gerenciamento de fotos
- API endpoints para CRUD completo

### 2. Módulo de Projetos
- Gerenciamento de projetos das feiras
- Cadastro e edição de informações dos projetos
- Associação com equipes e turmas
- Sistema de ativação/desativação de projetos
- API endpoints para operações específicas

## Segurança
- Validação de dados em todas as operações
- Proteção contra injeção SQL
- Controle de acesso baseado em permissões
- Sanitização de inputs
- Proteção contra CSRF

## Integração
- Sistema de autenticação
- Módulo de Vitrine para exibição pública
- Sistema de gerenciamento de turmas
- Upload e gerenciamento de arquivos

## Desenvolvimento
- Ambiente de desenvolvimento configurado
- Scripts de build e deploy
- Documentação detalhada por módulo
- Testes automatizados (quando aplicável)

Para mais detalhes sobre cada módulo, consulte a documentação específica em:
- `src/pages/api/Candidatos/README.md`
- `src/pages/api/Projetos/README.md`

