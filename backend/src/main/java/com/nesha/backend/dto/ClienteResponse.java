package com.nesha.backend.dto;

import com.nesha.backend.entity.Usuario;
import com.nesha.backend.service.AgendamentoService;

// desde: ano do cadastro, para o "Cliente Nesha desde 2023" do perfil.
public record ClienteResponse(
        UsuarioResponse usuario, String telefone, EnderecoResponse endereco, String fotoUrl, int desde) {

    public static ClienteResponse from(Usuario usuario) {
        return new ClienteResponse(
                UsuarioResponse.from(usuario),
                usuario.getTelefone(),
                EnderecoResponse.from(usuario.getEndereco()),
                usuario.urlDaFoto(),
                usuario.getCriadoEm().atZone(AgendamentoService.FUSO).getYear());
    }
}
