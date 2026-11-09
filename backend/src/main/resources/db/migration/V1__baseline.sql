-- Baseline: schema atual gerado pelo Hibernate (ddl-auto=update) para a tabela `usuarios`,
-- com os campos de `Usuario` e o `Endereco` embutido. A partir desta migration, o Flyway
-- passa a ser a fonte da verdade do schema (ddl-auto=validate em todos os perfis).
CREATE TABLE usuarios (
    id UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL,
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT uk_usuarios_cpf UNIQUE (cpf)
);
