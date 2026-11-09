package com.nesha.backend.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "prestador_perfil",
        uniqueConstraints = {@UniqueConstraint(name = "uk_prestador_perfil_usuario", columnNames = "usuario_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrestadorPerfil {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "servico_principal", nullable = false)
    private String servicoPrincipal;

    @Column(name = "area_atendimento", nullable = false)
    private String areaAtendimento;

    @Column(name = "sobre_mim", length = 2000)
    private String sobreMim;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_preco", nullable = false, length = 20)
    private UnidadePreco unidadePreco;

    @Column(name = "tempo_resposta", length = 100)
    private String tempoResposta;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @ElementCollection
    @CollectionTable(name = "prestador_especialidade", joinColumns = @JoinColumn(name = "prestador_id"))
    @Column(name = "especialidade", nullable = false)
    @Builder.Default
    private List<String> especialidades = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "prestador_dia_atendimento", joinColumns = @JoinColumn(name = "prestador_id"))
    @Column(name = "dia_semana", nullable = false)
    @OrderBy("asc")
    @Builder.Default
    private List<Integer> diasAtendimento = new ArrayList<>();
}
