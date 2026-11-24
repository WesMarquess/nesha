package com.nesha.backend.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "agendamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prestador_id", nullable = false)
    private Usuario prestador;

    @Column(nullable = false)
    private String servico;

    // null quando o prestador ainda não definiu preço ("a combinar").
    @Column(precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private Instant inicio;

    @Column(nullable = false)
    private Instant fim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAgendamento status;

    @Embedded
    @AttributeOverride(name = "cep", column = @Column(name = "end_cep", nullable = false, length = 8))
    @AttributeOverride(name = "logradouro", column = @Column(name = "end_logradouro", nullable = false))
    @AttributeOverride(name = "numero", column = @Column(name = "end_numero", nullable = false, length = 10))
    @AttributeOverride(name = "complemento", column = @Column(name = "end_complemento"))
    @AttributeOverride(name = "bairro", column = @Column(name = "end_bairro", nullable = false))
    @AttributeOverride(name = "cidade", column = @Column(name = "end_cidade", nullable = false))
    @AttributeOverride(name = "uf", column = @Column(name = "end_uf", nullable = false, length = 2))
    private Endereco endereco;

    @Column(length = 500)
    private String observacoes;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    @Column(name = "avaliacao_nota")
    private Integer avaliacaoNota;

    @Column(name = "avaliacao_comentario", length = 300)
    private String avaliacaoComentario;

    @Column(name = "avaliado_em")
    private Instant avaliadoEm;

    @ElementCollection
    @CollectionTable(name = "agendamento_destaque", joinColumns = @JoinColumn(name = "agendamento_id"))
    @Column(name = "destaque", nullable = false, length = 50)
    @Builder.Default
    private List<String> destaques = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "pagamento_status", length = 20)
    private StatusPagamento pagamentoStatus;

    // Preferência do Checkout Pro e pagamento aprovado no Mercado Pago (usado no estorno).
    @Column(name = "pagamento_preferencia_id", length = 100)
    private String pagamentoPreferenciaId;

    @Column(name = "pagamento_id", length = 50)
    private String pagamentoId;

    @Column(name = "pagamento_atualizado_em")
    private Instant pagamentoAtualizadoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @Builder.Default
    private Instant criadoEm = Instant.now();

    public boolean avaliado() {
        return avaliacaoNota != null;
    }
}
