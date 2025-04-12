# Arquitetura do Sistema LP-CMS

## Visão Geral

O LP-CMS é uma aplicação web desenvolvida com Next.js para gerenciamento de projetos, eventos, alunos e avaliações. A arquitetura segue os princípios de Clean Architecture e Clean Code, sendo modular, escalável e de fácil manutenção.

## Padrões de Projeto

### Clean Architecture

A aplicação é dividida em camadas concêntricas:

1. **Camada de Apresentação (Presentation)**
   - API Routes do Next.js
   - Componentes React
   - Páginas

2. **Camada de Aplicação (Application)**
   - Serviços
   - Casos de Uso
   - Regras de Negócio

3. **Camada de Domínio (Domain)**
   - Entidades
   - Interfaces
   - Regras de Negócio Core

4. **Camada de Infraestrutura (Infrastructure)**
   - Banco de Dados
   - Serviços Externos
   - Configurações

### Repository Pattern

```javascript
// Exemplo de interface de repositório
interface IProjetoRepository {
  create(projeto: Projeto): Promise<Projeto>;
  update(id: number, projeto: Partial<Projeto>): Promise<Projeto>;
  findById(id: number): Promise<Projeto | null>;
  findAll(): Promise<Projeto[]>;
  delete(id: number): Promise<void>;
}
```

### Service Layer

```javascript
// Exemplo de serviço
class ProjetoService {
  constructor(private repository: IProjetoRepository) {}

  async criarProjeto(dados: CriarProjetoDTO): Promise<Projeto> {
    // Validações
    // Regras de negócio
    // Chamada ao repositório
  }
}
```

## Estrutura do Projeto

```
src/
├── pages/
│   ├── api/
│   │   ├── Projetos/
│   │   ├── Eventos/
│   │   ├── Alunos/
│   │   └── Avaliacoes/
│   └── [páginas públicas]
├── components/
│   ├── common/
│   ├── layout/
│   └── [componentes específicos]
├── config/
│   ├── database.js
│   └── enums.js
├── middleware/
│   ├── auth.js
│   └── error.js
└── types/
    └── index.d.ts
```

## Banco de Dados

### PostgreSQL

O sistema utiliza PostgreSQL como banco de dados principal, com as seguintes tabelas principais:

1. **Usuarios**
   - id_usuario (PK)
   - nome
   - email
   - senha
   - tipo_usuario

2. **Alunos**
   - id_aluno (PK)
   - ra
   - fk_id_usuario (FK)
   - turma

3. **Projetos**
   - id_projeto (PK)
   - titulo
   - descricao
   - foto_url
   - tlr
   - cea
   - turma
   - ativo
   - data_criacao
   - data_alteracao

4. **Eventos**
   - id_evento (PK)
   - nome_evento
   - tipo_evento
   - descricao
   - data_inicio
   - data_fim
   - ativo

### Relacionamentos

- Um Usuario pode ser um Aluno
- Um Projeto pertence a uma Turma
- Um Projeto pode ter múltiplas Imagens
- Um Projeto pode ter múltiplos Integrantes
- Um Projeto pode estar associado a múltiplos ODS
- Um Projeto pode estar associado a múltiplas Linhas de Extensão
- Um Projeto pode estar associado a múltiplas Categorias
- Um Evento pode ter múltiplos Projetos

## Segurança

### Autenticação

- JWT (JSON Web Tokens)
- Middleware de autenticação
- Proteção de rotas
- Validação de tokens

### Autorização

- Níveis de acesso baseados em tipo_usuario
- Validação de permissões
- Proteção de endpoints sensíveis

### Validação de Dados

- Validação de entrada em todos os endpoints
- Sanitização de dados
- Proteção contra SQL Injection
- Proteção contra XSS

## Padrões de Código

### Clean Code

- Nomes significativos
- Funções pequenas e focadas
- Comentários apenas quando necessário
- Código auto-documentado

### SOLID

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

## Decisões Arquiteturais

### Next.js API Routes

- Escolha do Next.js para API Routes
- Vantagens:
  - SSR/SSG
  - API integrada
  - Fácil deploy
  - Boa performance

### PostgreSQL

- Escolha do PostgreSQL como banco de dados
- Vantagens:
  - ACID
  - JSONB
  - Relacionamentos
  - Performance

### JWT

- Autenticação via JWT
- Vantagens:
  - Stateless
  - Escalável
  - Seguro
  - Fácil implementação

## Considerações Futuras

### Microserviços

- Possível separação em microserviços
- Vantagens:
  - Escalabilidade
  - Manutenção
  - Deploy independente

### Cache

- Implementação de cache
- Redis ou Memcached
- Melhor performance

### Eventos Assíncronos

- Mensageria
- RabbitMQ ou Kafka
- Processamento assíncrono

### Monitoramento

- Logs
- Métricas
- Alertas
- Observabilidade 