# LP-CMS - Sistema de Gerenciamento de Conteúdo

Sistema de gerenciamento de conteúdo desenvolvido para a disciplina de Laboratório de Programação.

## Visão Geral

O LP-CMS é uma aplicação web desenvolvida com Next.js que permite o gerenciamento de projetos, eventos, alunos e avaliações. O sistema foi projetado para ser modular, escalável e fácil de manter.

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: API Routes (Next.js)
- **Banco de Dados**: PostgreSQL

## Estrutura do Projeto

```
src/
├── pages/
│   ├── api/
│   │   ├── Alunos/
│   │   ├── Avaliacoes/
│   │   ├── Eventos/
│   │   ├── Projetos/
│   │   └── Usuarios/
│   └── ...
├── components/
├── config/
└── ...
```

## Documentação

Para mais detalhes sobre a arquitetura e API, consulte:

- [Arquitetura do Sistema](ARCHITECTURE.md)
- [Documentação da API](API_DOCS.md)
- [Documentação dos Projetos](src/pages/api/Projetos/README.md)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/lp-cms.git
cd lp-cms
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Variáveis de Ambiente

- `DATABASE_URL`: URL de conexão com o PostgreSQL
- `JWT_SECRET`: Chave secreta para assinatura dos tokens JWT
- `NODE_ENV`: Ambiente de execução (development/production)

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a versão de produção
- `npm start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run test`: Executa os testes

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Descrição: ##
O LP-CMS será o sistema de gerenciamento de conteúdo do projeto, permitindo que administradores cadastrem e gerenciem informações sobre candidatos (representantes de turma) e projetos das feiras FTX e HubTec.

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

## Estrutura da API

### Módulos Disponíveis
- `src/pages/api/Usuarios/` - Gerenciamento de usuários e seus tipos específicos
  - `src/pages/api/Usuarios/Alunos/` - Informações específicas de alunos
  - `src/pages/api/Usuarios/README.md` - Documentação do módulo de usuários
- `src/pages/api/Eventos/` - Gerenciamento de eventos
  - `src/pages/api/Eventos/README.md` - Documentação do módulo de eventos
- `src/pages/api/Projetos/` - Gerenciamento de projetos
  - `src/pages/api/Projetos/README.md` - Documentação do módulo de projetos