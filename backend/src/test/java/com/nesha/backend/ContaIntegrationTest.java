package com.nesha.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

// Configurações da conta: perfil do cliente, troca de senha e foto de perfil.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class ContaIntegrationTest {

    // Assinatura PNG seguida de alguns bytes: o suficiente para o backend reconhecer o formato.
    private static final byte[] PNG = {
        (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'
    };

    private static final String ENDERECO = """
            {"cep":"01310100","logradouro":"Avenida Paulista","numero":"1000",
             "bairro":"Bela Vista","cidade":"São Paulo","uf":"SP"}
            """;

    @Autowired
    private MockMvc mockMvc;

    private MockMvcTester mvc() {
        return MockMvcTester.create(mockMvc);
    }

    private record Conta(String email, String token) {}

    private String cpfUnico() {
        return "997" + String.format("%08d", Math.abs(UUID.randomUUID().hashCode()) % 100000000);
    }

    private String login(String email, String senha) throws Exception {
        MvcTestResult resposta = mvc().perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha)));
        assertThat(resposta).hasStatus(200);
        return JsonPath.read(resposta.getResponse().getContentAsString(), "$.accessToken");
    }

    private Conta cadastrar(String rota, String extras) throws Exception {
        String email = "conta-" + UUID.randomUUID() + "@example.com";
        assertThat(mvc().perform(MockMvcRequestBuilders.post(rota)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Maria Silva","cpf":"%s","telefone":"11987654321","email":"%s",
                                 "senha":"Senha@123","endereco":%s%s}
                                """
                                .formatted(cpfUnico(), email, ENDERECO, extras))))
                .hasStatus(201);
        return new Conta(email, login(email, "Senha@123"));
    }

    private Conta cliente() throws Exception {
        return cadastrar("/api/v1/clientes", "");
    }

    private Conta prestador() throws Exception {
        return cadastrar(
                "/api/v1/prestadores",
                ",\"servicoPrincipal\":\"Jardineiro\",\"areaAtendimento\":\"São Paulo - Centro\"");
    }

    private static String corpoCliente(String cep) {
        return """
                {"nome":"Maria Oliveira","telefone":"11912345678",
                 "endereco":{"cep":"%s","logradouro":"Rua das Flores","numero":"123",
                             "complemento":"Apt 42","bairro":"Jardins","cidade":"São Paulo","uf":"SP"}}
                """
                .formatted(cep);
    }

    @Test
    void perfilCliente_devolveTelefoneEEndereco() throws Exception {
        Conta conta = cliente();

        var resposta = mvc().perform(MockMvcRequestBuilders.get("/api/v1/clientes/me")
                .header("Authorization", "Bearer " + conta.token()));

        assertThat(resposta).hasStatus(200);
        assertThat(resposta).bodyJson().extractingPath("$.telefone").isEqualTo("11987654321");
        assertThat(resposta).bodyJson().extractingPath("$.endereco.logradouro").isEqualTo("Avenida Paulista");
        assertThat(resposta).bodyJson().extractingPath("$.fotoUrl").isNull();
        assertThat(resposta).bodyJson().extractingPath("$.desde")
                .isEqualTo(java.time.Year.now(java.time.ZoneId.of("America/Sao_Paulo")).getValue());
    }

    @Test
    void atualizarCliente_comDadosValidos_salvaContatoEEndereco() throws Exception {
        Conta conta = cliente();

        var resposta = mvc().perform(MockMvcRequestBuilders.put("/api/v1/clientes/me")
                .header("Authorization", "Bearer " + conta.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpoCliente("01415000")));

        assertThat(resposta).hasStatus(200);
        assertThat(resposta).bodyJson().extractingPath("$.usuario.nome").isEqualTo("Maria Oliveira");
        assertThat(resposta).bodyJson().extractingPath("$.endereco.complemento").isEqualTo("Apt 42");

        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/clientes/me")
                        .header("Authorization", "Bearer " + conta.token())))
                .bodyJson()
                .extractingPath("$.endereco.cep")
                .isEqualTo("01415000");
    }

    @Test
    void atualizarCliente_comCepInvalido_devolve400NoCampo() throws Exception {
        Conta conta = cliente();

        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/clientes/me")
                        .header("Authorization", "Bearer " + conta.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCliente("123"))))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.campos['endereco.cep']")
                .isNotNull();
    }

    @Test
    void perfilCliente_comContaDePrestador_devolve404() throws Exception {
        Conta conta = prestador();

        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/clientes/me")
                        .header("Authorization", "Bearer " + conta.token())))
                .hasStatus(404)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("CLIENTE_NAO_ENCONTRADO");
    }

    @Test
    void alterarSenha_comSenhaAtualCorreta_permiteEntrarComANova() throws Exception {
        Conta conta = cliente();

        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/usuarios/me/senha")
                        .header("Authorization", "Bearer " + conta.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"senhaAtual\":\"Senha@123\",\"novaSenha\":\"NovaSenha@456\"}")))
                .hasStatus(204);

        assertThat(mvc().perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"senha\":\"Senha@123\"}".formatted(conta.email()))))
                .hasStatus(401);
        assertThat(login(conta.email(), "NovaSenha@456")).isNotBlank();
    }

    @Test
    void alterarSenha_comSenhaAtualErrada_devolve400() throws Exception {
        Conta conta = prestador();

        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/usuarios/me/senha")
                        .header("Authorization", "Bearer " + conta.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"senhaAtual\":\"Errada@123\",\"novaSenha\":\"NovaSenha@456\"}")))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("SENHA_ATUAL_INCORRETA");
    }

    @Test
    void alterarSenha_comNovaSenhaFraca_devolve400() throws Exception {
        Conta conta = cliente();

        assertThat(mvc().perform(MockMvcRequestBuilders.put("/api/v1/usuarios/me/senha")
                        .header("Authorization", "Bearer " + conta.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"senhaAtual\":\"Senha@123\",\"novaSenha\":\"fraca\"}")))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.campos.novaSenha")
                .isNotNull();
    }

    @Test
    void enviarFoto_doCliente_ficaDisponivelPublicamente() throws Exception {
        Conta conta = cliente();

        var envio = mvc().perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/v1/usuarios/me/foto")
                .file(new MockMultipartFile("foto", "foto.png", "image/png", PNG))
                .header("Authorization", "Bearer " + conta.token()));

        assertThat(envio).hasStatus(200);
        String fotoUrl = JsonPath.read(envio.getResponse().getContentAsString(), "$.fotoUrl");
        assertThat(fotoUrl).matches("/usuarios/[0-9a-f-]+/foto\\?v=\\d+");

        var foto = mvc().perform(MockMvcRequestBuilders.get("/api/v1" + fotoUrl));
        assertThat(foto).hasStatus(200).hasContentType("image/png");
        assertThat(foto.getResponse().getContentAsByteArray()).isEqualTo(PNG);

        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/clientes/me")
                        .header("Authorization", "Bearer " + conta.token())))
                .bodyJson()
                .extractingPath("$.fotoUrl")
                .isEqualTo(fotoUrl);
    }

    @Test
    void enviarFoto_doPrestador_apareceNoPerfilDoPrestador() throws Exception {
        Conta conta = prestador();

        var envio = mvc().perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/v1/usuarios/me/foto")
                .file(new MockMultipartFile("foto", "foto.png", "image/png", PNG))
                .header("Authorization", "Bearer " + conta.token()));
        String fotoUrl = JsonPath.read(envio.getResponse().getContentAsString(), "$.fotoUrl");

        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/prestadores/me")
                        .header("Authorization", "Bearer " + conta.token())))
                .bodyJson()
                .extractingPath("$.fotoUrl")
                .isEqualTo(fotoUrl);
    }

    @Test
    void enviarFoto_arquivoQueNaoEImagem_devolve400() throws Exception {
        Conta conta = cliente();

        // O Content-Type diz que é imagem, mas o conteúdo não é: o backend olha os bytes.
        assertThat(mvc().perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/v1/usuarios/me/foto")
                        .file(new MockMultipartFile("foto", "foto.png", "image/png", "<script>".getBytes()))
                        .header("Authorization", "Bearer " + conta.token())))
                .hasStatus(400)
                .bodyJson()
                .extractingPath("$.codigo")
                .isEqualTo("FOTO_INVALIDA");
    }

    @Test
    void buscarFoto_deUsuarioSemFoto_devolve404() {
        assertThat(mvc().perform(MockMvcRequestBuilders.get("/api/v1/usuarios/" + UUID.randomUUID() + "/foto")))
                .hasStatus(404);
    }
}
