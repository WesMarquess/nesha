package com.nesha.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class PrestadorIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockMvcTester mvc() {
        return MockMvcTester.create(mockMvc);
    }

    private String cpfUnico() {
        return "999" + String.format("%08d", Math.abs(UUID.randomUUID().hashCode()) % 100000000);
    }

    private String corpoCadastro(String email, String cpf) {
        return """
                {
                  "nome": "Francisco Oliveira",
                  "cpf": "%s",
                  "telefone": "11987654321",
                  "email": "%s",
                  "senha": "Senha@123",
                  "endereco": {
                    "cep": "01310100",
                    "logradouro": "Avenida Paulista",
                    "numero": "1000",
                    "bairro": "Bela Vista",
                    "cidade": "São Paulo",
                    "uf": "SP"
                  },
                  "servicoPrincipal": "Jardinagem",
                  "areaAtendimento": "São Paulo - Zona Sul e Oeste",
                  "sobreMim": "Jardineiro experiente.",
                  "preco": 130.00,
                  "unidadePreco": "DIA",
                  "tempoResposta": "Menos de 1 hora",
                  "especialidades": ["Poda de árvores", "Manutenção de jardim"],
                  "diasAtendimento": [1, 2, 3, 4, 5, 6]
                }
                """
                .formatted(cpf, email);
    }

    @Test
    void cadastrarPrestador_comSucesso_devolve201ComPerfilPrestador() {
        String email = "prestador-" + UUID.randomUUID() + "@email.com";

        var resultado = mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpoCadastro(email, cpfUnico())));

        assertThat(resultado)
                .hasStatus(201)
                .bodyJson()
                .extractingPath("$.usuario.perfil")
                .isEqualTo("PRESTADOR");
    }

    @Test
    void cadastrarPrestador_comEmailDuplicado_devolve409() {
        String email = "prestador-dup-" + UUID.randomUUID() + "@email.com";

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro(email, cpfUnico()))))
                .hasStatus(201);

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro(email, cpfUnico()))))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("EMAIL_JA_CADASTRADO");
    }

    @Test
    void cadastrarPrestador_comCpfDuplicado_devolve409() {
        String cpf = cpfUnico();

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("prestador-cpf1-" + UUID.randomUUID() + "@email.com", cpf))))
                .hasStatus(201);

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("prestador-cpf2-" + UUID.randomUUID() + "@email.com", cpf))))
                .hasStatus(409)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("CPF_JA_CADASTRADO");
    }

    @Test
    void cadastrarPrestador_comCampoObrigatorioAusente_devolve400() {
        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("VALIDACAO");
    }

    @Test
    void loginPrestador_devolvePerfilPrestadorNaResposta() {
        String email = "prestador-login-" + UUID.randomUUID() + "@email.com";

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/prestadores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro(email, cpfUnico()))))
                .hasStatus(201);

        String corpoLogin =
                """
                { "email": "%s", "senha": "Senha@123" }
                """
                        .formatted(email);

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin)))
                .hasStatus(200)
                .bodyJson()
                .extractingPath("$.usuario.perfil")
                .isEqualTo("PRESTADOR");
    }
}
