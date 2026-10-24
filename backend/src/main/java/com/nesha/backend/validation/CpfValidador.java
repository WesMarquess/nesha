package com.nesha.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// Projeto acadêmico: confere só o formato (11 dígitos), sem checar dígito
// verificador — não é necessário que o CPF cadastrado seja um documento real.
public class CpfValidador implements ConstraintValidator<CpfValido, String> {

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {
        return cpf != null && cpf.matches("\\d{11}");
    }
}
