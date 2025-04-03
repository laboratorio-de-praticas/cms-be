# Documentação - Módulo de Candidatos

## Visão Geral
O módulo de Candidatos é responsável pelo gerenciamento de representantes de turma, permitindo o cadastro, edição e visualização de informações dos candidatos.

## Funcionalidades

### 1. Cadastro de Candidatos
- Permite o cadastro de novos candidatos com informações pessoais
- Upload de fotos dos candidatos
- Validação de dados obrigatórios
- Armazenamento seguro das informações

### 2. Gerenciamento de Candidatos
- Visualização de todos os candidatos cadastrados
- Edição de informações dos candidatos
- Exclusão de candidatos (quando necessário)
- Filtros e busca por candidatos específicos

### 3. API Endpoints

#### Criar Candidato
```http
POST /api/Candidatos/Create
Content-Type: multipart/form-data

{
    "dados": {
        "ra": "123456789",
        "nome": "João Silva",
        "email_institucional": "joao.silva@fatec.sp.gov.br",
        "telefone": "(11) 99999-9999",
        "senha": "senha123",
        "turma_atual": "DSM4",
        "curso": "Desenvolvimento de Software Multiplataforma",
        "semestre": "4",
        "ano_ingresso": "2022",
        "deseja_ser_candidato": "true",
        "link_video": "https://youtube.com/...",
        "descricao_campanha": "Minha proposta de campanha..."
    },
    "foto": [arquivo]
}
```

Campos Obrigatórios:
- `ra`: Registro Acadêmico (único)
- `nome`: Nome completo do candidato
- `email_institucional`: Email institucional (@fatec.sp.gov.br)
- `telefone`: Número de telefone
- `senha`: Senha de acesso
- `turma_atual`: Turma atual
- `curso`: Curso do candidato
- `semestre`: Semestre atual
- `ano_ingresso`: Ano de ingresso

Campos Opcionais:
- `deseja_ser_candidato`: Boolean (default: false)
- `link_video`: URL do vídeo de campanha
- `descricao_campanha`: Descrição da campanha
- `foto`: Imagem de perfil

Validações:
- Email institucional deve terminar com @fatec.sp.gov.br
- RA e email institucional devem ser únicos
- Foto deve ser JPG, PNG, GIF ou WEBP
- Tamanho máximo da foto: 5MB

Resposta:
```json
{
    "success": true,
    "message": "Candidato criado com sucesso",
    "data": {
        "id": 1,
        "ra": "123456789",
        "nome": "João Silva",
        "email_institucional": "joao.silva@fatec.sp.gov.br",
        "telefone": "(11) 99999-9999",
        "turma_atual": "DSM4",
        "foto_url": "/imgs/candidatos/123456789.jpg",
        "deseja_ser_candidato": true,
        "link_video": "https://youtube.com/...",
        "descricao_campanha": "Minha proposta de campanha...",
        "curso": "Desenvolvimento de Software Multiplataforma",
        "semestre": "4",
        "ano_ingresso": "2022",
        "status_candidatura": "pendente",
        "created_at": "2024-04-03T10:00:00Z"
    }
}
```

#### Listar Todos os Candidatos
```http
GET /api/Candidatos/Get_all
```

Resposta:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "ra": "123456789",
            "nome": "João Silva",
            "email_institucional": "joao.silva@fatec.sp.gov.br",
            "telefone": "(11) 99999-9999",
            "turma_atual": "DSM4",
            "foto_url": "/imgs/candidatos/123456789.jpg",
            "deseja_ser_candidato": true,
            "link_video": "https://youtube.com/...",
            "descricao_campanha": "Minha proposta de campanha...",
            "curso": "Desenvolvimento de Software Multiplataforma",
            "semestre": "4",
            "ano_ingresso": "2022",
            "status_candidatura": "pendente",
            "created_at": "2024-04-03T10:00:00Z"
        }
    ]
}
```

#### Atualizar Candidato
```http
PUT /api/Candidatos/Update
Content-Type: multipart/form-data

{
    "dados": {
        "id": 1,
        "nome": "João Silva Santos",
        "email_institucional": "joao.silva@fatec.sp.gov.br",
        "telefone": "(11) 97777-7777",
        "turma_atual": "DSM4",
        "curso": "Desenvolvimento de Software Multiplataforma",
        "semestre": "4",
        "ano_ingresso": "2022",
        "deseja_ser_candidato": "true",
        "link_video": "https://youtube.com/...",
        "descricao_campanha": "Nova proposta de campanha..."
    },
    "foto": [arquivo]
}
```

Resposta:
```json
{
    "success": true,
    "message": "Candidato atualizado com sucesso",
    "data": {
        "id": 1,
        "ra": "123456789",
        "nome": "João Silva Santos",
        "email_institucional": "joao.silva@fatec.sp.gov.br",
        "telefone": "(11) 97777-7777",
        "turma_atual": "DSM4",
        "foto_url": "/imgs/candidatos/123456789.jpg",
        "deseja_ser_candidato": true,
        "link_video": "https://youtube.com/...",
        "descricao_campanha": "Nova proposta de campanha...",
        "curso": "Desenvolvimento de Software Multiplataforma",
        "semestre": "4",
        "ano_ingresso": "2022",
        "status_candidatura": "pendente",
        "updated_at": "2024-04-03T12:00:00Z"
    }
}
```

#### Excluir Candidato
```http
DELETE /api/Candidatos/Perm
Content-Type: application/json

{
    "id": 1
}
```

Resposta:
```json
{
    "success": true,
    "message": "Candidato excluído permanentemente"
}
```

## Estrutura de Dados
Os candidatos possuem as seguintes informações:
- `id`: Identificador único
- `ra`: Registro Acadêmico (único)
- `nome`: Nome completo
- `email_institucional`: Email institucional (@fatec.sp.gov.br)
- `telefone`: Número de telefone
- `senha`: Senha criptografada
- `turma_atual`: Turma atual
- `foto`: URL da foto de perfil
- `deseja_ser_candidato`: Boolean
- `link_video`: URL do vídeo de campanha
- `descricao_campanha`: Descrição da campanha
- `curso`: Curso do candidato
- `semestre`: Semestre atual
- `ano_ingresso`: Ano de ingresso
- `status_candidatura`: Status da candidatura
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Segurança
- Validação de dados antes do cadastro
- Verificação de permissões para operações de edição/exclusão
- Proteção contra dados inválidos ou maliciosos
- Senhas armazenadas com hash bcrypt
- Validação de email institucional
- Validação de tipos e tamanhos de arquivos

## Integração
O módulo de Candidatos está integrado com:
- Sistema de autenticação
- Módulo de Projetos
- Sistema de exibição pública (Vitrine) 