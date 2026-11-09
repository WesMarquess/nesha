package com.nesha.backend.dto;

import com.nesha.backend.entity.UnidadePreco;
import com.nesha.backend.validation.CpfValido;
import com.nesha.backend.validation.TelefoneValido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CadastroPrestadorRequest(
        @NotBlank(message = "Nome é obrigatório.")
                @Pattern(regexp = "\\S+\\s+\\S+.*", message = "Informe nome e sobrenome.")
                String nome,
        @NotBlank @CpfValido String cpf,
        @NotBlank @TelefoneValido String telefone,
        @NotBlank @Email(message = "E-mail inválido.") String email,
        @NotBlank
                @Pattern(
                        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$",
                        message =
                                "Senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.")
                String senha,
        @Valid EnderecoRequest endereco,
        @NotBlank(message = "Serviço principal é obrigatório.") @Size(max = 255) String servicoPrincipal,
        @NotBlank(message = "Área de atendimento é obrigatória.") @Size(max = 255) String areaAtendimento,
        @Size(max = 2000) String sobreMim,
        @NotNull(message = "Preço é obrigatório.")
                @DecimalMin(value = "0.0", inclusive = false, message = "Preço deve ser maior que zero.")
                @Digits(integer = 8, fraction = 2)
                BigDecimal preco,
        UnidadePreco unidadePreco,
        @Size(max = 100) String tempoResposta,
        @NotEmpty(message = "Informe ao menos uma especialidade.") List<@NotBlank String> especialidades,
        @NotEmpty(message = "Informe ao menos um dia de atendimento.")
                List<@Min(0) @Max(6) Integer> diasAtendimento) {}
