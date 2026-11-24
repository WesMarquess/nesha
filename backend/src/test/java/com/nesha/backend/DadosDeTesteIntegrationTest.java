package com.nesha.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.nesha.backend.config.DadosDeTeste;
import com.nesha.backend.repository.PrestadorPerfilRepository;
import com.nesha.backend.repository.UsuarioRepository;
import com.nesha.backend.service.ClienteService;
import com.nesha.backend.service.PrestadorService;
import com.nesha.backend.validation.CpfValidador;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DadosDeTesteIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PrestadorPerfilRepository prestadorPerfilRepository;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private PrestadorService prestadorService;

    @Test
    void criaClienteEDoisPrestadoresPorServico_semDuplicarAoRodarDeNovo() throws Exception {
        DadosDeTeste dados = new DadosDeTeste(usuarioRepository, clienteService, prestadorService);
        dados.run(null);
        long usuarios = usuarioRepository.count();
        dados.run(null);

        assertThat(usuarioRepository.count()).isEqualTo(usuarios);
        assertThat(usuarioRepository.existsByEmailIgnoreCase(DadosDeTeste.EMAIL_CLIENTE)).isTrue();

        List<String> catalogo = servicosDoCatalogoDoApp();
        assertThat(catalogo).hasSize(16);
        Map<String, Long> porServico = prestadorPerfilRepository.findByOnlineTrueAndServicoPrincipalIn(catalogo).stream()
                .collect(Collectors.groupingBy(p -> p.getServicoPrincipal(), Collectors.counting()));
        assertThat(porServico.keySet()).containsExactlyInAnyOrderElementsOf(catalogo);
        assertThat(porServico.values()).allMatch(total -> total >= 2);
    }

    @Test
    void cpfsGeradosSaoValidos() {
        CpfValidador validador = new CpfValidador();
        for (int i = 0; i <= 40; i++) {
            assertThat(validador.isValid(DadosDeTeste.cpf(i), null)).as("cpf %d", i).isTrue();
        }
    }

    // Títulos do catálogo do app; o servicoPrincipal do prestador precisa ser igual a eles.
    private static List<String> servicosDoCatalogoDoApp() throws IOException {
        String mocks = Files.readString(Path.of("../src/utils/mocks.ts"));
        String servicos = mocks.substring(mocks.indexOf("export const mockServices"), mocks.indexOf("export const mockProfessionals"));
        return Pattern.compile("title: '([^']+)'").matcher(servicos).results().map(m -> m.group(1)).toList();
    }
}
