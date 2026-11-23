-- "Cliente desde 2023" / "Parceiro desde 2021": data de cadastro do usuário.
ALTER TABLE usuarios ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Agendamento de um serviço: o cliente solicita, o prestador aceita ou recusa,
-- e depois conclui. O endereço é uma cópia do endereço do cliente no momento
-- da solicitação (se o cliente mudar de endereço, o agendamento não muda).
CREATE TABLE agendamentos (
    id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    prestador_id UUID NOT NULL,
    servico VARCHAR(255) NOT NULL,
    valor NUMERIC(10, 2),
    inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    end_cep VARCHAR(8) NOT NULL,
    end_logradouro VARCHAR(255) NOT NULL,
    end_numero VARCHAR(10) NOT NULL,
    end_complemento VARCHAR(255),
    end_bairro VARCHAR(255) NOT NULL,
    end_cidade VARCHAR(255) NOT NULL,
    end_uf VARCHAR(2) NOT NULL,
    observacoes VARCHAR(500),
    motivo_cancelamento VARCHAR(255),
    avaliacao_nota INTEGER,
    avaliacao_comentario VARCHAR(300),
    avaliado_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_agendamentos PRIMARY KEY (id),
    CONSTRAINT fk_agendamentos_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios (id),
    CONSTRAINT fk_agendamentos_prestador FOREIGN KEY (prestador_id) REFERENCES usuarios (id),
    CONSTRAINT ck_agendamentos_periodo CHECK (fim > inicio),
    CONSTRAINT ck_agendamentos_nota CHECK (avaliacao_nota IS NULL OR avaliacao_nota BETWEEN 1 AND 5)
);

CREATE INDEX ix_agendamentos_cliente ON agendamentos (cliente_id, inicio);
CREATE INDEX ix_agendamentos_prestador ON agendamentos (prestador_id, inicio);

-- Destaques escolhidos na avaliação (ex.: "Pontualidade", "Gentileza").
CREATE TABLE agendamento_destaque (
    agendamento_id UUID NOT NULL,
    destaque VARCHAR(50) NOT NULL,
    CONSTRAINT pk_agendamento_destaque PRIMARY KEY (agendamento_id, destaque),
    CONSTRAINT fk_agendamento_destaque_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos (id)
);
