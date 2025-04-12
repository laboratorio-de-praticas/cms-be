# API de Visitantes

Esta API gerencia os visitantes do sistema, incluindo a geração e gerenciamento de chaves de acesso.

## Endpoints

### GET /api/Visitantes/Get_all
Retorna a lista de todos os visitantes do sistema, ordenados por data de criação (mais recentes primeiro).

**Resposta:**
```json
{
  "mensagem": "Visitantes recuperados com sucesso",
  "total": 10,
  "dados": [
    {
      "id_visitante": 1,
      "nome": "Nome do Visitante",
      "telefone": "11999999999",
      "chave_acesso": "1234",
      "data_criacao": "2024-01-01T00:00:00.000Z",
      "data_alteracao": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/Visitantes/Get_id?id_visitante={id}
Retorna os dados de um visitante específico.

**Parâmetros:**
- `id_visitante`: ID do visitante a ser buscado

**Resposta:**
```json
{
  "mensagem": "Visitante encontrado com sucesso",
  "dados": {
    "id_visitante": 1,
    "nome": "Nome do Visitante",
    "telefone": "11999999999",
    "chave_acesso": "1234",
    "data_criacao": "2024-01-01T00:00:00.000Z",
    "data_alteracao": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/Visitantes/Create
Cria um novo visitante no sistema.

**Corpo da Requisição:**
```json
{
  "nome": "Nome do Visitante",
  "telefone": "11999999999"
}
```

**Resposta:**
```json
{
  "mensagem": "Visitante cadastrado com sucesso!",
  "dados": {
    "id_visitante": 1,
    "nome": "Nome do Visitante",
    "telefone": "11999999999",
    "chave_acesso": "1234",
    "data_criacao": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/Visitantes/Update?id_visitante={id}
Atualiza os dados de um visitante existente.

**Parâmetros:**
- `id_visitante`: ID do visitante a ser atualizado

**Corpo da Requisição:**
```json
{
  "nome": "Novo Nome",
  "telefone": "11999999999"
}
```

**Resposta:**
```json
{
  "mensagem": "Visitante atualizado com sucesso",
  "dados": {
    "id_visitante": 1,
    "nome": "Novo Nome",
    "telefone": "11999999999",
    "chave_acesso": "1234",
    "data_criacao": "2024-01-01T00:00:00.000Z",
    "data_alteracao": "2024-01-02T00:00:00.000Z"
  }
}
```

### PUT /api/Visitantes/Active
Ativa um visitante no sistema, gerando uma nova chave de acesso.

**Corpo da Requisição:**
```json
{
  "id_visitante": 1
}
```

**Resposta:**
```json
{
  "mensagem": "Visitante ativado com sucesso",
  "dados": {
    "id_visitante": 1,
    "nome": "Nome do Visitante",
    "telefone": "11999999999",
    "chave_acesso": "5678"
  }
}
```

### PUT /api/Visitantes/Disable
Desativa um visitante no sistema, removendo sua chave de acesso.

**Corpo da Requisição:**
```json
{
  "id_visitante": 1
}
```

**Resposta:**
```json
{
  "mensagem": "Visitante desativado com sucesso",
  "dados": {
    "id_visitante": 1,
    "nome": "Nome do Visitante",
    "telefone": "11999999999"
  }
}
```

## Estrutura da Tabela Visitantes
```sql
CREATE TABLE "Visitantes" (
  id_visitante SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  chave_acesso CHAR(4),
  data_criacao TIMESTAMP DEFAULT now(),
  data_alteracao TIMESTAMP DEFAULT now()
);
```

## Observações
1. O campo `telefone` deve ser único no sistema
2. A chave de acesso é um código de 4 dígitos gerado aleatoriamente
3. Um visitante está ativo quando possui uma chave de acesso
4. Um visitante está inativo quando sua chave de acesso é NULL
5. Todas as operações são realizadas dentro de transações para garantir a integridade dos dados
6. O sistema mantém histórico de alterações através dos campos `data_criacao` e `data_alteracao`
7. Em ambiente de desenvolvimento, mensagens de erro detalhadas são retornadas
8. Todas as operações de escrita são realizadas dentro de transações para garantir a integridade dos dados
9. Validações são realizadas antes de cada operação para garantir a consistência dos dados
10. As conexões com o banco de dados são sempre fechadas após o uso 