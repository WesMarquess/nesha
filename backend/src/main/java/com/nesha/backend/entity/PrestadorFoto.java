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

@Entity
@Table(name = "prestador_foto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrestadorFoto {

    @Id
    @Column(name = "prestador_id")
    private UUID prestadorId;

    @Column(nullable = false)
    private byte[] conteudo;

    @Column(nullable = false, length = 50)
    private String tipo;
}
