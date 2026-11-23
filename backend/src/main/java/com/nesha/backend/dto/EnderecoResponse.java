package com.nesha.backend.dto;

import com.nesha.backend.entity.Endereco;

public record EnderecoResponse(
        String cep, String logradouro, String numero, String complemento, String bairro, String cidade, String uf) {

    public static EnderecoResponse from(Endereco endereco) {
        return new EnderecoResponse(
                endereco.getCep(),
                endereco.getLogradouro(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getUf());
    }
}
