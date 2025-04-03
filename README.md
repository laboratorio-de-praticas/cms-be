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

