create type usuarioTipos as Enum ('Admin', 'Atendente');
create type eventoTipos as Enum ('Externo', 'Interno');
create type eventoStatus as Enum('Ativo', 'Em_Preparo', 'Em_Contagem', 'Finalizado');
create type candidatoSituacao as Enum('Pendente', 'Ativo', 'Encerrado');
create type usuarioStatus as Enum('Pendente', 'Ativo', 'Desligado');

create table Usuarios(
id SERIAL PRIMARY KEY,
nome VARCHAR(250),
senha VARCHAR(400),
email_institucional VARCHAR(250),
tipo_usuario usuarioTipos,
status_usuario usuarioStatus,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table Projetos(
id_projeto SERIAL PRIMARY KEY,
titulo VARCHAR(255) NOT NULL,
descricao VARCHAR(200) NOT NULL,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table Fotos_Projetos(
id_foto_projeto SERIAL PRIMARY KEY,
foto_url VARCHAR(300),
foto_extensao VARCHAR(30),
fk_id_projeto INT,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (fk_id_projeto) REFERENCES Projetos(id_projeto)
);

create table Categorias (
id_categoria SERIAL PRIMARY KEY,
nome VARCHAR(120),
descricao TEXT,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table Categorias_Projetos(
id SERIAL PRIMARY KEY,
fk_id_projeto INT,
fk_id_categoria INT,
FOREIGN KEY (fk_id_projeto) REFERENCES Projetos(id_projeto),
FOREIGN KEY (fk_id_categoria) REFERENCES Categorias(id_categoria),
UNIQUE(id, fk_id_projeto, fk_id_categoria),
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table Alunos(
id_aluno SERIAL PRIMARY KEY,
foto_url VARCHAR(300),
data_ingresso  TIMESTAMP,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
curso_semestre VARCHAR(50),
fk_id_usuario INT,
FOREIGN KEY (fk_id_usuario) REFERENCES Usuarios(id)
);


create table Visitantes(
id_visitante SERIAL PRIMARY KEY,
nome_social VARCHAR(200),
celular VARCHAR(12),
data_nascimento TIMESTAMP, 
chave_acesso VARCHAR(4) CHECK (chave_acesso ~ '^\d{4}$')
);

create table Eventos(
id_evento SERIAL PRIMARY KEY,
tipo_evento eventoTipos,
nome_evento VARCHAR(255),
descricao_evento TEXT,
status_evento eventoStatus,
curso_semestre VARCHAR(50),
data_inicio TIMESTAMP,
data_fim TIMESTAMP,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Candidato (
    id SERIAL PRIMARY KEY,
    id_aluno INT,
    id_projeto INT,
    id_evento INT,
    qrcode VARCHAR(255),
    situacao_candidato candidatoSituacao,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_aluno) REFERENCES Alunos(id_aluno),
    FOREIGN KEY (id_projeto) REFERENCES Projetos(id_projeto),
    FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento)
);

create table Participantes (
	id_participante SERIAL PRIMARY KEY,
	id_aluno INT,
	id_visitante INT,
	id_evento INT,
	avaliador boolean,
	FOREIGN KEY (id_aluno) REFERENCES Alunos(id_aluno),
	FOREIGN KEY (id_visitante) REFERENCES Visitantes(id_visitante),
	FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento)
); 

create table Votos(
id_voto SERIAL PRIMARY KEY,
id_candidato INT,
id_participante INT,
id_evento INT,
FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento),
FOREIGN KEY (id_participante) REFERENCES Participantes(id_participante),
FOREIGN KEY (id_candidato) REFERENCES Candidato(id)
);