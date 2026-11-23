package com.nesha.backend.dto;

import com.nesha.backend.entity.UnidadePreco;
import com.nesha.backend.validation.TelefoneValido;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

// Substitui os dados editáveis do perfil. O app envia todos os campos (os que não
// mudaram vão com o valor atual). E-mail e CPF não são editáveis.
public record AtualizarPrestadorRequest(
        @NotBlank(message = "Nome é obrigatório.")
                @Pattern(regexp = "\\S+\\s+\\S+.*", message = "Informe nome e sobrenome.")
                @Size(max = 255)
                String nome,
        @NotBlank @TelefoneValido String telefone,
        @NotBlank(message = "Serviço principal é obrigatório.") @Size(max = 255) String servicoPrincipal,
        @NotBlank(message = "Área de atendimento é obrigatória.") @Size(max = 255) String areaAtendimento,
        @Size(max = 2000) String sobreMim,
        @DecimalMin(value = "0.0", inclusive = false, message = "Preço deve ser maior que zero.")
                @Digits(integer = 8, fraction = 2)
                BigDecimal preco,
        UnidadePreco unidadePreco,
        @NotNull(message = "Informe se você está online.") Boolean online) {}
