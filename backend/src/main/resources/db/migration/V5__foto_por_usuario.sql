-- A foto de perfil deixa de ser só do prestador: o cliente também tem (configuracoes-cliente).
-- Move a foto para o nível do usuário, preservando as que já foram enviadas.
CREATE TABLE usuario_foto (
    usuario_id UUID NOT NULL,
    conteudo BYTEA NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    CONSTRAINT pk_usuario_foto PRIMARY KEY (usuario_id),
    CONSTRAINT fk_usuario_foto_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

INSERT INTO usuario_foto (usuario_id, conteudo, tipo)
SELECT pp.usuario_id, pf.conteudo, pf.tipo
FROM prestador_foto pf
JOIN prestador_perfil pp ON pp.id = pf.prestador_id;

ALTER TABLE usuarios ADD COLUMN foto_atualizada_em TIMESTAMP;

UPDATE usuarios
SET foto_atualizada_em = (
    SELECT pp.foto_atualizada_em FROM prestador_perfil pp WHERE pp.usuario_id = usuarios.id
);

DROP TABLE prestador_foto;
ALTER TABLE prestador_perfil DROP COLUMN foto_atualizada_em;
