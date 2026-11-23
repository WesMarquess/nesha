package com.nesha.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AlterarSenhaRequest(
        @NotBlank(message = "Informe sua senha atual.") String senhaAtual,
        @NotBlank(message = "Informe a nova senha.")
                @Pattern(
                        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$",
                        message =
                                "Senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.")
                String novaSenha) {}
