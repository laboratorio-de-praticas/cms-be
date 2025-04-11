# Módulo de Projetos

## Visão Geral
O módulo de Projetos gerencia todas as operações relacionadas aos projetos, incluindo criação, atualização, exclusão e consulta. Cada projeto pode ter múltiplas imagens, estar associado a ODS, Linhas de Extensão e Áreas Temáticas, e possui um QR Code único.

## Endpoints

### 1. Listar Todos os Projetos
```
GET /api/Projetos/Get_all
```
- Retorna todos os projetos ativos
- Inclui informações sobre ODS, Linhas de Extensão, Áreas Temáticas e imagens
- Resposta:
```json
{
  "mensagem": "Projetos recuperados com sucesso",
  "projetos": [
    {
      "id": "uuid",
      "nome_projeto": "string",
      "nome_equipe": "string",
      "tlr": "string",
      "imagem_capa": "string",
      "turma": "string",
      "descricao": "string",
      "cea": "string",
      "ativo": boolean,
      "area_atuacao": "string",
      "qr_code": "string",
      "ods": {
        "ids": [number],
        "descricoes": [string]
      },
      "linhas_extensao": {
        "ids": [number],
        "descricoes": [string]
      },
      "areas_tematicas": {
        "ids": [number],
        "descricoes": [string]
      },
      "integrantes": [string],
      "imagens": [string]
    }
  ]
}
```

### 2. Buscar Projeto por ID
```
GET /api/Projetos/Get_id?id=uuid
```
- Retorna os detalhes de um projeto específico
- Parâmetros:
  - id (obrigatório): UUID do projeto
- Resposta: Mesmo formato do Get_all, mas para um único projeto

### 3. Buscar Projetos por Turma
```
GET /api/Projetos/Get_turma?turma=string
```
- Retorna todos os projetos de uma turma específica
- Parâmetros:
  - turma (obrigatório): Nome da turma
- Resposta: Mesmo formato do Get_all

### 4. Criar Projeto
```
POST /api/Projetos/Create
```
- Cria um novo projeto
- Body (form-data):
  - nome_projeto (obrigatório): string
  - nome_equipe (obrigatório): string
  - tlr (obrigatório): string
  - turma (obrigatório): string
  - descricao (obrigatório): string
  - cea (obrigatório): string
  - area_atuacao (obrigatório): string
  - capa: arquivo de imagem
  - imagens: múltiplos arquivos de imagem
  - ods_ids: string (array JSON)
  - linhas_extensao_ids: string (array JSON)
  - areas_tematicas_ids: string (array JSON)
  - integrantes_ids: string (array JSON)
- Resposta:
```json
{
  "mensagem": "Projeto criado com sucesso",
  "projeto": {
    "id": "uuid",
    "nome_projeto": "string",
    "qr_code": "string",
    // ... outros campos do projeto
  }
}
```

### 5. Atualizar Projeto
```
PUT /api/Projetos/Update?id=uuid
```
- Atualiza um projeto existente
- Parâmetros:
  - id (obrigatório): UUID do projeto
- Body (form-data): Mesmos campos da criação, mas todos opcionais
- Resposta: Mesmo formato da criação

### 6. Deletar Projeto
```
DELETE /api/Projetos/Delete?id=uuid
```
- Marca um projeto como inativo
- Parâmetros:
  - id (obrigatório): UUID do projeto
- Resposta:
```json
{
  "mensagem": "Projeto deletado com sucesso"
}
```

## Estrutura de Dados

### Tabela Projetos
```sql
CREATE TABLE Projetos (
  id_projeto TEXT PRIMARY KEY,
  nome_projeto TEXT NOT NULL,
  nome_equipe TEXT NOT NULL,
  tlr TEXT NOT NULL,
  imagem_capa TEXT,
  turma TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cea TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  area_atuacao TEXT NOT NULL,
  qr_code TEXT
);
```

### Tabelas Relacionadas
- ProjetoODS
- ProjetoLinhaExtensao
- ProjetoAreaTematica
- ImagensProjeto
- IntegrantesEquipe

## Observações
- Todos os endpoints retornam status 200 em caso de sucesso
- Em caso de erro, retornam status 400, 401, 404 ou 500 com mensagem de erro
- As imagens são salvas no diretório `public/imgs/projetos/`
- Os QR Codes são gerados automaticamente e salvos em `public/imgs/projetos/qrcodes/` 