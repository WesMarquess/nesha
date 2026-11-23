-- Selo "Online" do painel do prestador: indica se ele está recebendo novas solicitações.
ALTER TABLE prestador_perfil ADD COLUMN online BOOLEAN DEFAULT TRUE NOT NULL;

-- A foto passa a ser enviada pelo app (upload) em vez de uma URL externa.
-- foto_atualizada_em versiona a URL da foto para o app não mostrar uma imagem antiga do cache.
ALTER TABLE prestador_perfil DROP COLUMN foto_url;
ALTER TABLE prestador_perfil ADD COLUMN foto_atualizada_em TIMESTAMP;

-- Bytes da foto em tabela própria, para não carregá-los a cada leitura do perfil.
CREATE TABLE prestador_foto (
    prestador_id UUID NOT NULL,
    conteudo BYTEA NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    CONSTRAINT pk_prestador_foto PRIMARY KEY (prestador_id),
    CONSTRAINT fk_prestador_foto_prestador FOREIGN KEY (prestador_id) REFERENCES prestador_perfil (id)
);
