package com.nesha.backend.dto;

import com.nesha.backend.entity.Usuario;

public record ClienteResponse(UsuarioResponse usuario, String telefone, EnderecoResponse endereco, String fotoUrl) {

    public static ClienteResponse from(Usuario usuario) {
        return new ClienteResponse(
                UsuarioResponse.from(usuario),
                usuario.getTelefone(),
                EnderecoResponse.from(usuario.getEndereco()),
                usuario.urlDaFoto());
    }
}
