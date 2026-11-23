package com.nesha.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Bytes da foto de perfil em tabela própria, para não carregá-los a cada leitura do usuário.
@Entity
@Table(name = "usuario_foto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioFoto {

    @Id
    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(nullable = false)
    private byte[] conteudo;

    @Column(nullable = false, length = 50)
    private String tipo;
}
