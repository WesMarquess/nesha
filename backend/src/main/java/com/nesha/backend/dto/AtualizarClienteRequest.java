package com.nesha.backend.dto;

import com.nesha.backend.validation.TelefoneValido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Substitui os dados editáveis do cliente. E-mail e CPF não são editáveis.
public record AtualizarClienteRequest(
        @NotBlank(message = "Nome é obrigatório.")
                @Pattern(regexp = "\\S+\\s+\\S+.*", message = "Informe nome e sobrenome.")
                @Size(max = 255)
                String nome,
        @NotBlank @TelefoneValido String telefone,
        @NotNull(message = "Endereço é obrigatório.") @Valid EnderecoRequest endereco) {}
