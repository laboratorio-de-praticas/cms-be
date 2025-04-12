const ENUMS = {
    UsuarioTipos: {
        ADMIN: 'Admin',
        ATENDENTE: 'Atendente',
        PROFESSOR: 'Professor',
        INTERNO: 'Interno'
    },
    UsuarioStatus: {
        PENDENTE: 'Pendente',
        ATIVO: 'Ativo',
        DESLIGADO: 'Desligado'
    },
    RepresentanteSituacao: {
        PENDENTE: 'Pendente',
        ATIVO: 'Ativo',
        DESLIGADO: 'Desligado'
    },
    EventoStatus: {
        ATIVO: 'Ativo',
        EM_PREPARO: 'Em_Preparo',
        EM_CONTAGEM: 'Em_Contagem',
        FINALIZADO: 'Finalizado'
    },
    EventoTipos: {
        EXTERNO: 'Externo',
        INTERNO: 'Interno'
    }
};

module.exports = ENUMS; 