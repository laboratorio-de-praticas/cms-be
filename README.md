# CMS - Sistema de Gerenciamento de Conteúdo

## Visão Geral
O CMS é um sistema de gerenciamento de conteúdo desenvolvido para gerenciar projetos, eventos e candidatos. O sistema permite o cadastro e gerenciamento de projetos acadêmicos, organização de eventos e controle de candidaturas para representantes de turma.

## Tecnologias Utilizadas
- Next.js
- SQLite
- JWT para autenticação
- QR Code para identificação de candidatos
- Multer para upload de arquivos

## Estrutura do Projeto
```
src/
├── pages/
│   ├── api/
│   │   ├── Projetos/     # Módulo de gerenciamento de projetos
│   │   ├── Eventos/      # Módulo de gerenciamento de eventos
│   │   ├── Candidatos/   # Módulo de gerenciamento de candidatos
│   │   └── Usuarios/     # Módulo de autenticação e usuários
│   └── public/
│       ├── imgs/         # Diretório para imagens
│       └── qrcodes/      # Diretório para QR Codes
```

## Módulos Principais

### 1. Projetos
- Gerenciamento completo de projetos acadêmicos
- Upload de imagens
- Associação com ODS, Linhas de Extensão e Áreas Temáticas
- Geração de QR Code para cada projeto
- [Documentação detalhada](src/pages/api/Projetos/README.md)

### 2. Eventos
- Criação e gerenciamento de eventos
- Associação de projetos e candidatos
- Controle de datas e locais
- [Documentação detalhada](src/pages/api/Eventos/README.md)

### 3. Candidatos
- Cadastro e aprovação de candidatos
- Geração de QR Code para identificação
- Integração com o módulo de usuários
- [Documentação detalhada](src/pages/api/Candidatos/README.md)

### 4. Usuários
- Autenticação e autorização
- Diferentes tipos de usuários (aluno, professor, admin)
- Upload de fotos de perfil
- [Documentação detalhada](src/pages/api/Usuarios/README.md)

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos para Instalação
1. Clone o repositório
2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. Execute o projeto:
```bash
npm run dev
# ou
yarn dev
```

## Testando a API
Para testar os endpoints da API, você pode usar o Postman ou qualquer outro cliente HTTP. Consulte a documentação específica de cada módulo para detalhes sobre os endpoints disponíveis.

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
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

