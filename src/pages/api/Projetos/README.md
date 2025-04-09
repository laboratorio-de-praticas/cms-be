# Documentação - Módulo de Projetos

## Visão Geral
Este módulo gerencia o cadastro e visualização de projetos, incluindo a geração automática de QR Codes para cada projeto.

## Funcionalidades

### 1. Cadastro de Projetos
- Permite o cadastro de novos projetos
- Upload de fotos e materiais relacionados
- Associação com equipe responsável
- Categorização por turma/curso
- Validação de dados obrigatórios
- Geração automática de QR Code para cada projeto

### 2. Gerenciamento de Projetos
- Visualização de todos os projetos cadastrados
- Edição de informações dos projetos
- Ativação/desativação de projetos
- Filtros por turma e status
- Busca por projetos específicos

## Autenticação

Para acessar as rotas protegidas do módulo de Projetos, é necessário realizar o login e obter um token JWT. Este token deve ser incluído no cabeçalho `Authorization` de cada requisição para as rotas que requerem autenticação.

### Login
Para obter o token, você deve fazer uma requisição ao endpoint de login:

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "seu_email@fatec.sp.gov.br",
    "senha": "sua_senha"
}
```

Resposta esperada:
```json
{
    "success": true,
    "token": "seu_token_jwt_aqui"
}
```

### Uso do Token
Após obter o token, você deve incluí-lo nas requisições para as rotas protegidas. O formato do cabeçalho deve ser:

Authorization: Bearer seu_token_jwt_aqui

### 3. API Endpoints

#### Criar Projeto
```http
POST /api/Projetos/Create
Content-Type: multipart/form-data
Authorization: Bearer seu_token_jwt_aqui

{
    "nome_projeto": "string",
    "nome_equipe": "string",
    "tlr": "string",
    "turma": "string",
    "descricao": "string",
    "cea": "string",
    "area_atuacao": "string",
    "imagem_capa": "file (opcional)",
    "imagens": ["file"] (opcional)
}
```

Resposta:
```json
{
    "success": true,
    "message": "Projeto criado com sucesso",
    "data": {
        "id": "string",
        "nome_projeto": "string",
        "nome_equipe": "string",
        "tlr": "string",
        "turma": "string",
        "descricao": "string",
        "cea": "string",
        "area_atuacao": "string",
        "imagem_capa": "string",
        "imagens": ["string"],
        "qr_code": "string"
    }
}
```

#### Listar Todos os Projetos
```http
GET /api/Projetos/Get_all
Authorization: Bearer seu_token_jwt_aqui
```

Resposta:
```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "nome_projeto": "string",
            "nome_equipe": "string",
            "tlr": "string",
            "turma": "string",
            "descricao": "string",
            "cea": "string",
            "area_atuacao": "string",
            "imagem_capa": "string",
            "imagens": ["string"],
            "qr_code": "string"
        }
    ]
}
```

#### Listar Projetos Ativos
```http
GET /api/Projetos/Get_active
```

Resposta:
```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "nome_projeto": "string",
            "nome_equipe": "string",
            "tlr": "string",
            "turma": "string",
            "descricao": "string",
            "cea": "string",
            "area_atuacao": "string",
            "imagem_capa": "string",
            "imagens": ["string"],
            "qr_code": "string"
        }
    ]
}
```

#### Buscar Projeto por ID
```http
GET /api/Projetos/Get_id?id=1
Authorization: Bearer seu_token_jwt_aqui
```

Resposta:
```json
{
    "success": true,
    "data": {
        "id": "string",
        "nome_projeto": "string",
        "nome_equipe": "string",
        "tlr": "string",
        "turma": "string",
        "descricao": "string",
        "cea": "string",
        "area_atuacao": "string",
        "imagem_capa": "string",
        "imagens": ["string"],
        "qr_code": "string"
    }
}
```

#### Buscar Projetos por Turma
```http
GET /api/Projetos/Get_turma?turma=DSM4
```

Resposta:
```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "nome_projeto": "string",
            "nome_equipe": "string",
            "tlr": "string",
            "turma": "string",
            "descricao": "string",
            "cea": "string",
            "area_atuacao": "string",
            "imagem_capa": "string",
            "imagens": ["string"],
            "qr_code": "string"
        }
    ]
}
```

#### Atualizar Projeto
```http
PUT /api/Projetos/Update_Project
Content-Type: multipart/form-data
Authorization: Bearer seu_token_jwt_aqui

{
    "dados": {
        "id": "string",
        "nome_projeto": "string",
        "nome_equipe": "string",
        "tlr": "string",
        "turma": "string",
        "descricao": "string",
        "cea": "string",
        "area_atuacao": "string",
        "ods_ids": ["string"],
        "linha_extensao_ids": ["string"],
        "area_tematica_ids": ["string"],
        "integrantes": [
            {
                "nome": "string",
                "funcao": "string"
            }
        ]
    },
    "imagem_capa": "file (opcional)",
    "imagens_projeto": ["file"] (opcional)
}
```

Resposta:
```json
{
    "success": true,
    "message": "Projeto atualizado com sucesso",
    "data": {
        "id": "string",
        "nome_projeto": "string",
        "nome_equipe": "string",
        "tlr": "string",
        "turma": "string",
        "descricao": "string",
        "cea": "string",
        "area_atuacao": "string",
        "imagem_capa": "string",
        "imagens_projeto": ["string"],
        "ods": [
            {
                "id": "string",
                "nome": "string"
            }
        ],
        "linhas_extensao": [
            {
                "id": "string",
                "nome": "string"
            }
        ],
        "areas_tematicas": [
            {
                "id": "string",
                "nome": "string"
            }
        ],
        "integrantes": [
            {
                "nome": "string",
                "funcao": "string"
            }
        ],
        "qr_code": "string"
    }
}
```

#### Desativar Projeto
```http
PUT /api/Projetos/Disable
Content-Type: application/json
Authorization: Bearer seu_token_jwt_aqui

{
    "id": "string"
}
```

Resposta:
```json
{
    "success": true,
    "message": "Projeto desativado com sucesso",
    "data": {
        "id": "string",
        "status": "inativo",
        "updated_at": "2024-04-03T13:00:00Z"
    }
}
```

## Estrutura de Dados
Os projetos possuem as seguintes informações:
- `id_projeto`: Identificador único do projeto
- `nome_projeto`: Nome do projeto
- `nome_equipe`: Nome da equipe
- `tlr`: Indicador de Tecnologia, Liderança e Responsabilidade
- `imagem_capa`: URL da imagem de capa
- `turma`: Turma responsável
- `descricao`: Descrição detalhada
- `cea`: Indicador de Criatividade, Empreendedorismo e Aprendizagem
- `area_atuacao`: Área de atuação
- `qr_code`: URL do QR Code do projeto
- `ativo`: Status do projeto (ativo/inativo)

## Segurança
- Validação de dados antes do cadastro
- Verificação de permissões para operações de edição/exclusão
- Proteção contra dados inválidos ou maliciosos
- Validação de tipos e tamanhos de arquivos
- Controle de acesso baseado em permissões

## Integração
O módulo de Projetos está integrado com:
- Sistema de autenticação
- Módulo de Candidatos
- Sistema de exibição pública (Vitrine)
- Sistema de gerenciamento de turmas
- Sistema de geração de QR Codes 