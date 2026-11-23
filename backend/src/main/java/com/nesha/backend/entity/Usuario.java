package com.nesha.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "usuarios",
        uniqueConstraints = {
            @UniqueConstraint(name = "uk_usuarios_email", columnNames = "email"),
            @UniqueConstraint(name = "uk_usuarios_cpf", columnNames = "cpf")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, length = 11)
    private String cpf;

    @Column(nullable = false, length = 11)
    private String telefone;

    @Column(nullable = false)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Perfil perfil;

    @Embedded
    private Endereco endereco;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @Builder.Default
    private Instant criadoEm = Instant.now();

    // Muda a cada foto enviada; versiona a URL da foto para o app não usar uma imagem antiga do cache.
    @Column(name = "foto_atualizada_em")
    private Instant fotoAtualizadaEm;

    // Caminho relativo à base da API (/api/v1), ou null se não houver foto.
    public String urlDaFoto() {
        if (fotoAtualizadaEm == null) {
            return null;
        }
        return "/usuarios/%s/foto?v=%d".formatted(id, fotoAtualizadaEm.toEpochMilli());
    }
}
