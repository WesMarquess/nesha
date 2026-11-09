-- Dados exclusivos do perfil PRESTADOR, em tabela própria (um-para-um com `usuarios`)
-- para não criar colunas sempre nulas em quem é CLIENTE.
CREATE TABLE prestador_perfil (
    id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    servico_principal VARCHAR(255) NOT NULL,
    area_atendimento VARCHAR(255) NOT NULL,
    sobre_mim VARCHAR(2000),
    preco NUMERIC(10, 2) NOT NULL,
    unidade_preco VARCHAR(20) NOT NULL,
    tempo_resposta VARCHAR(100),
    foto_url VARCHAR(500),
    CONSTRAINT pk_prestador_perfil PRIMARY KEY (id),
    CONSTRAINT uk_prestador_perfil_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_prestador_perfil_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

-- Especialidades do prestador (lista), em tabela própria para permitir busca/filtro futuro.
CREATE TABLE prestador_especialidade (
    prestador_id UUID NOT NULL,
    especialidade VARCHAR(255) NOT NULL,
    CONSTRAINT pk_prestador_especialidade PRIMARY KEY (prestador_id, especialidade),
    CONSTRAINT fk_prestador_especialidade_prestador FOREIGN KEY (prestador_id) REFERENCES prestador_perfil (id)
);

-- Dias da semana em que o prestador atende (0 = domingo ... 6 = sábado).
-- A descrição legível de disponibilidade (ex.: "Seg a Sáb") é derivada destes dias na API,
-- não persistida, para não duplicar a mesma informação em dois formatos.
CREATE TABLE prestador_dia_atendimento (
    prestador_id UUID NOT NULL,
    dia_semana INTEGER NOT NULL,
    CONSTRAINT pk_prestador_dia_atendimento PRIMARY KEY (prestador_id, dia_semana),
    CONSTRAINT fk_prestador_dia_atendimento_prestador FOREIGN KEY (prestador_id) REFERENCES prestador_perfil (id)
);
