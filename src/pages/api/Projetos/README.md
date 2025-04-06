# Documentação - Módulo de Projetos

## Visão Geral
O módulo de Projetos é responsável pelo gerenciamento dos projetos das feiras FTX e HubTec, permitindo o cadastro, edição e visualização de informações dos projetos.

## Funcionalidades

### 1. Cadastro de Projetos
- Permite o cadastro de novos projetos
- Upload de fotos e materiais relacionados
- Associação com equipe responsável
- Categorização por turma/curso
- Validação de dados obrigatórios

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
    "dados": {
        "nome_Projeto": "Sistema de Gestão Escolar",
        "nome_equipe": "Equipe Alpha",
        "descricao": "Sistema para gerenciamento de atividades escolares",
        "turma": "DSM4",
        "tlr": "1",
        "cea": "1",
        "area_atuacao": "Educação",
        "ods_ids": [1, 2, 3],
        "linha_extensao_ids": [1, 2],
        "area_tematica_ids": [1],
        "integrantes": [
            {
                "nome": "João Silva",
                "funcao": "Desenvolvedor Backend"
            },
            {
                "nome": "Maria Santos",
                "funcao": "Desenvolvedora Frontend"
            }
        ]
    },
    "imagem_capa": [arquivo],
    "imagens_projeto": [arquivo1, arquivo2]
}
```

Campos Obrigatórios:
- `nome_Projeto`: Nome do projeto (único)
- `nome_equipe`: Nome da equipe
- `descricao`: Descrição detalhada do projeto
- `turma`: Turma responsável
- `tlr`: Indicador de Tecnologia, Liderança e Responsabilidade
- `cea`: Indicador de Criatividade, Empreendedorismo e Aprendizagem
- `area_atuacao`: Área de atuação do projeto

Campos Opcionais:
- `ods_ids`: IDs dos Objetivos de Desenvolvimento Sustentável
- `linha_extensao_ids`: IDs das Linhas de Extensão
- `area_tematica_ids`: IDs das Áreas Temáticas
- `imagem_capa`: Imagem de capa do projeto
- `imagens_projeto`: Imagens adicionais do projeto
- `integrantes`: Lista de integrantes da equipe

Validações:
- Nome do projeto deve ser único
- Imagens devem ser JPG, PNG, GIF ou WEBP
- Tamanho máximo de cada imagem: 5MB
- ODS, Linhas de Extensão e Áreas Temáticas devem existir no banco

Resposta:
```json
{
    "success": true,
    "message": "Projeto criado com sucesso",
    "data": {
        "id": 1,
        "nome_Projeto": "Sistema de Gestão Escolar",
        "nome_equipe": "Equipe Alpha",
        "descricao": "Sistema para gerenciamento de atividades escolares",
        "turma": "DSM4",
        "tlr": "1",
        "cea": "1",
        "area_atuacao": "Educação",
        "imagem_capa": "/imgs/projetos/capas/123456789.jpg",
        "imagens_projeto": [
            "/imgs/projetos/Imagens_Projeto/987654321.jpg",
            "/imgs/projetos/Imagens_Projeto/456789123.jpg"
        ],
        "ods": [
            {
                "id": 1,
                "nome": "ODS 1 - Erradicação da Pobreza"
            },
            {
                "id": 2,
                "nome": "ODS 2 - Fome Zero"
            },
            {
                "id": 3,
                "nome": "ODS 3 - Saúde e Bem-Estar"
            }
        ],
        "linhas_extensao": [
            {
                "id": 1,
                "nome": "Tecnologia e Inovação"
            },
            {
                "id": 2,
                "nome": "Educação"
            }
        ],
        "areas_tematicas": [
            {
                "id": 1,
                "nome": "Tecnologia da Informação"
            }
        ],
        "integrantes": [
            {
                "nome": "João Silva",
                "funcao": "Desenvolvedor Backend"
            },
            {
                "nome": "Maria Santos",
                "funcao": "Desenvolvedora Frontend"
            }
        ],
        "status": "ativo",
        "created_at": "2024-04-03T10:00:00Z"
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
            "id": 1,
            "nome_Projeto": "Sistema de Gestão Escolar",
            "nome_equipe": "Equipe Alpha",
            "descricao": "Sistema para gerenciamento de atividades escolares",
            "turma": "DSM4",
            "tlr": "1",
            "cea": "1",
            "area_atuacao": "Educação",
            "imagem_capa": "/imgs/projetos/capas/123456789.jpg",
            "imagens_projeto": [
                "/imgs/projetos/Imagens_Projeto/987654321.jpg",
                "/imgs/projetos/Imagens_Projeto/456789123.jpg"
            ],
            "ods": [
                {
                    "id": 1,
                    "nome": "ODS 1 - Erradicação da Pobreza"
                }
            ],
            "linhas_extensao": [
                {
                    "id": 1,
                    "nome": "Tecnologia e Inovação"
                }
            ],
            "areas_tematicas": [
                {
                    "id": 1,
                    "nome": "Tecnologia da Informação"
                }
            ],
            "integrantes": [
                {
                    "nome": "João Silva",
                    "funcao": "Desenvolvedor Backend"
                }
            ],
            "status": "ativo",
            "created_at": "2024-04-03T10:00:00Z"
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
            "id": 1,
            "nome_Projeto": "Sistema de Gestão Escolar",
            "nome_equipe": "Equipe Alpha",
            "descricao": "Sistema para gerenciamento de atividades escolares",
            "turma": "DSM4",
            "tlr": "1",
            "cea": "1",
            "area_atuacao": "Educação",
            "imagem_capa": "/imgs/projetos/capas/123456789.jpg",
            "imagens_projeto": [
                "/imgs/projetos/Imagens_Projeto/987654321.jpg",
                "/imgs/projetos/Imagens_Projeto/456789123.jpg"
            ],
            "status": "ativo",
            "created_at": "2024-04-03T10:00:00Z"
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
        "id": 1,
        "nome_Projeto": "Sistema de Gestão Escolar",
        "nome_equipe": "Equipe Alpha",
        "descricao": "Sistema para gerenciamento de atividades escolares",
        "turma": "DSM4",
        "tlr": "1",
        "cea": "1",
        "area_atuacao": "Educação",
        "imagem_capa": "/imgs/projetos/capas/123456789.jpg",
        "imagens_projeto": [
            "/imgs/projetos/Imagens_Projeto/987654321.jpg",
            "/imgs/projetos/Imagens_Projeto/456789123.jpg"
        ],
        "ods": [
            {
                "id": 1,
                "nome": "ODS 1 - Erradicação da Pobreza"
            }
        ],
        "linhas_extensao": [
            {
                "id": 1,
                "nome": "Tecnologia e Inovação"
            }
        ],
        "areas_tematicas": [
            {
                "id": 1,
                "nome": "Tecnologia da Informação"
            }
        ],
        "integrantes": [
            {
                "nome": "João Silva",
                "funcao": "Desenvolvedor Backend"
            }
        ],
        "status": "ativo",
        "created_at": "2024-04-03T10:00:00Z"
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
            "id": 1,
            "nome_Projeto": "Sistema de Gestão Escolar",
            "nome_equipe": "Equipe Alpha",
            "descricao": "Sistema para gerenciamento de atividades escolares",
            "turma": "DSM4",
            "tlr": "1",
            "cea": "1",
            "area_atuacao": "Educação",
            "imagem_capa": "/imgs/projetos/capas/123456789.jpg",
            "imagens_projeto": [
                "/imgs/projetos/Imagens_Projeto/987654321.jpg",
                "/imgs/projetos/Imagens_Projeto/456789123.jpg"
            ],
            "status": "ativo",
            "created_at": "2024-04-03T10:00:00Z"
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
        "id": 1,
        "nome_Projeto": "Sistema de Gestão Escolar 2.0",
        "nome_equipe": "Equipe Alpha",
        "descricao": "Sistema aprimorado para gerenciamento de atividades escolares",
        "turma": "DSM4",
        "tlr": "1",
        "cea": "1",
        "area_atuacao": "Educação",
        "ods_ids": [1, 2, 3],
        "linha_extensao_ids": [1, 2],
        "area_tematica_ids": [1],
        "integrantes": [
            {
                "nome": "João Silva",
                "funcao": "Desenvolvedor Full Stack"
            },
            {
                "nome": "Maria Santos",
                "funcao": "Desenvolvedora Frontend"
            }
        ]
    },
    "imagem_capa": [arquivo],
    "imagens_projeto": [arquivo1, arquivo2]
}
```

Resposta:
```json
{
    "success": true,
    "message": "Projeto atualizado com sucesso",
    "data": {
        "id": 1,
        "nome_Projeto": "Sistema de Gestão Escolar 2.0",
        "nome_equipe": "Equipe Alpha",
        "descricao": "Sistema aprimorado para gerenciamento de atividades escolares",
        "turma": "DSM4",
        "tlr": "1",
        "cea": "1",
        "area_atuacao": "Educação",
        "imagem_capa": "/imgs/projetos/capas/123456789.jpg",
        "imagens_projeto": [
            "/imgs/projetos/Imagens_Projeto/987654321.jpg",
            "/imgs/projetos/Imagens_Projeto/456789123.jpg"
        ],
        "ods": [
            {
                "id": 1,
                "nome": "ODS 1 - Erradicação da Pobreza"
            }
        ],
        "linhas_extensao": [
            {
                "id": 1,
                "nome": "Tecnologia e Inovação"
            }
        ],
        "areas_tematicas": [
            {
                "id": 1,
                "nome": "Tecnologia da Informação"
            }
        ],
        "integrantes": [
            {
                "nome": "João Silva",
                "funcao": "Desenvolvedor Full Stack"
            }
        ],
        "status": "ativo",
        "updated_at": "2024-04-03T12:00:00Z"
    }
}
```

#### Desativar Projeto
```http
PUT /api/Projetos/Disable
Content-Type: application/json
Authorization: Bearer seu_token_jwt_aqui

{
    "id": 1
}
```

Resposta:
```json
{
    "success": true,
    "message": "Projeto desativado com sucesso",
    "data": {
        "id": 1,
        "status": "inativo",
        "updated_at": "2024-04-03T13:00:00Z"
    }
}
```

## Estrutura de Dados
Os projetos possuem as seguintes informações:
- `id`: Identificador único
- `nome_Projeto`: Nome do projeto (único)
- `nome_equipe`: Nome da equipe
- `descricao`: Descrição detalhada
- `turma`: Turma responsável
- `tlr`: Indicador de Tecnologia, Liderança e Responsabilidade
- `cea`: Indicador de Criatividade, Empreendedorismo e Aprendizagem
- `area_atuacao`: Área de atuação
- `imagem_capa`: URL da imagem de capa
- `imagens_projeto`: Lista de URLs das imagens do projeto
- `ods`: Lista de Objetivos de Desenvolvimento Sustentável
- `linhas_extensao`: Lista de Linhas de Extensão
- `areas_tematicas`: Lista de Áreas Temáticas
- `integrantes`: Lista de integrantes da equipe
- `status`: Status do projeto (ativo/inativo)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Segurança
- Validação de dados antes do cadastro
- Verificação de permissões para operações de edição/exclusão
- Proteção contra dados inválidos ou maliciosos
- Validação de tipos e tamanhos de arquivos
- Controle de acesso baseado em permissões
- Validação de relacionamentos (ODS, Linhas de Extensão, Áreas Temáticas)

## Integração
O módulo de Projetos está integrado com:
- Sistema de autenticação
- Módulo de Candidatos
- Sistema de exibição pública (Vitrine)
- Sistema de gerenciamento de turmas
- Sistema de ODS
- Sistema de Linhas de Extensão
- Sistema de Áreas Temáticas 