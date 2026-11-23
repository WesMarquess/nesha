package com.nesha.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class PrestadorPerfilIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockMvcTester mvc() {
        return MockMvcTester.create(mockMvc);
    }

    private String cpfUnico() {
        return "998" + String.format("%08d", Math.abs(UUID.randomUUID().hashCode()) % 100000000);
    }

    private static final String ENDERECO = """
            {"cep":"01310100","logradouro":"Avenida Paulista","numero":"1000",
             "bairro":"Bela Vista","cidade":"São Paulo","uf":"SP"}
            """;

    // Cadastra um usuário pelo endpoint informado e devolve o accessToken do login.
    private String cadastrarELogar(String rota, String extras) throws Exception {
        String email = "perfil-" + UUID.randomUUID() + "@email.com";
        String corpo = """
                {"nome":"Francisco Oliveira","cpf":"%s","telefone":"11987654321","email":"%s",
                 "senha":"Senha@123","endereco":%s%s}
                """
                .formatted(cpfUnico(), email, ENDERECO, extras);

        assertThat(mvc().perform(MockMvcRequestBuilders.post(rota)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo)))
                .hasStatus(201);

        MvcTestResult login = mvc().perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"Senha@123\"}".formatted(email)));

        return JsonPath.read(login.getResponse().getContentAsString(), "$.accessToken");
    }

    private String tokenPrestador() throws Exception {
        return cadastrarELogar(
                "/api/v1/prestadores",
                ",\"servicoPrincipal\":\"Jardineiro\",\"areaAtendimento\":\"São Paulo - Centro\"");
    }

    private static String corpoAtualizacao(String telefone) {
        return """
                {"nome":"Francisco de Oliveira","telefone":"%s","servicoPrincipal":"Jardinagem e Paisagismo",
                 "areaAtendimento":"São Paulo • Zona Sul e Oeste","sobreMim":"  Jardineiro há 8 anos.  ",
                 "preco":130.00,"unidadePreco":"DIA","online":false}
                """
                .formatted(telefone);
    }

    @Test
    void atualizarPerfil_comDadosValidos_devolvePerfilAtualizado() throws Exception {
        String token = tokenPrestador();

        var resposta = mvc().perform(MockMvcRequestBuilders.put("/api/v1/prestadores/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpoAtualizacao("11912345678")));

        assertThat(resposta).hasStatus(200);
        assertThat(resposta).bodyJson().extractingPath("$.usuario.nome").isEqualTo("Francisco de Oliveira");
        assertThat(resposta).bodyJson().extractingPath("$.telefone").isEqualTo("11912345678");
        assertThat(resposta).bodyJson().extractingPath("$.sobreMim").isEqualTo("Jardineiro há 8 anos.");
        assertThat(resposta).bodyJson().extractingPath("$.preco").isEqualTo(130.0);
        assertThat(resposta).bodyJson().extractingPath("$.online").isEqualTo(false);

        // A mudança fica salva: o GET seguinte devolve os mesmos dados.
        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/prestadores/me")
                        .header("Authorization", "Bearer " + token)))
                .bodyJson()
                .extractingPath("$.servicoPrincipal")
                .isEqualTo("Jardinagem e Paisagismo");
    }

    @Test
    void atualizarPerfil_comTelefoneInvalido_devolve400() throws Exception {
        String token = tokenPrestador();

        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/prestadores/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoAtualizacao("123"))))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.campos.telefone")
                .isNotNull();
    }

    @Test
    void atualizarPerfil_semToken_devolve401() {
        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/prestadores/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoAtualizacao("11912345678"))))
                .hasStatus(401);
    }

    @Test
    void atualizarPerfil_comContaDeCliente_devolve404() throws Exception {
        String tokenCliente = cadastrarELogar("/api/v1/clientes", "");

        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/prestadores/me")
                        .header("Authorization", "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoAtualizacao("11912345678"))))
                .hasStatus(404)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("PRESTADOR_NAO_ENCONTRADO");
    }
}
