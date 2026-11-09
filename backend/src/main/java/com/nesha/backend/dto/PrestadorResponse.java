package com.nesha.backend.dto;

import com.nesha.backend.entity.PrestadorPerfil;
import com.nesha.backend.entity.UnidadePreco;
import java.math.BigDecimal;
import java.util.List;

public record PrestadorResponse(
        UsuarioResponse usuario,
        String servicoPrincipal,
        String areaAtendimento,
        String sobreMim,
        BigDecimal preco,
        UnidadePreco unidadePreco,
        String tempoResposta,
        String fotoUrl,
        List<String> especialidades,
        List<Integer> diasAtendimento,
        String disponibilidade) {

    private static final String[] ABREVIACOES_DIAS = {"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"};

    public static PrestadorResponse from(PrestadorPerfil perfil) {
        return new PrestadorResponse(
                UsuarioResponse.from(perfil.getUsuario()),
                perfil.getServicoPrincipal(),
                perfil.getAreaAtendimento(),
                perfil.getSobreMim(),
                perfil.getPreco(),
                perfil.getUnidadePreco(),
                perfil.getTempoResposta(),
                perfil.getFotoUrl(),
                perfil.getEspecialidades(),
                perfil.getDiasAtendimento(),
                descreverDisponibilidade(perfil.getDiasAtendimento()));
    }

    // Deriva um texto legível (ex.: "Seg a Sáb") a partir dos dias de atendimento, em vez de
    // persistir essa descrição junto com a lista de dias e correr o risco dos dois ficarem
    // desalinhados.
    private static String descreverDisponibilidade(List<Integer> diasAtendimento) {
        if (diasAtendimento == null || diasAtendimento.isEmpty()) {
            return "";
        }

        List<Integer> dias = diasAtendimento.stream().sorted().toList();
        boolean contiguo = true;
        for (int i = 1; i < dias.size(); i++) {
            if (dias.get(i) - dias.get(i - 1) != 1) {
                contiguo = false;
                break;
            }
        }

        if (contiguo) {
            int primeiro = dias.get(0);
            int ultimo = dias.get(dias.size() - 1);
            return primeiro == ultimo
                    ? ABREVIACOES_DIAS[primeiro]
                    : ABREVIACOES_DIAS[primeiro] + " a " + ABREVIACOES_DIAS[ultimo];
        }

        return dias.stream().map(dia -> ABREVIACOES_DIAS[dia]).reduce((a, b) -> a + ", " + b).orElse("");
    }
}
