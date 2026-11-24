package com.nesha.backend.config;

import com.nesha.backend.dto.CadastroClienteRequest;
import com.nesha.backend.dto.CadastroPrestadorRequest;
import com.nesha.backend.dto.EnderecoRequest;
import com.nesha.backend.entity.UnidadePreco;
import com.nesha.backend.repository.UsuarioRepository;
import com.nesha.backend.service.ClienteService;
import com.nesha.backend.service.PrestadorService;
import java.math.BigDecimal;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

// Contas prontas para testar e apresentar o app (só no perfil dev, nesha.dados-de-teste=true):
// um cliente e dois prestadores para cada serviço do catálogo do app (src/utils/mocks.ts).
// Cada conta só é criada se o e-mail ainda não existir, então rodar de novo não duplica nada.
// Todas usam a senha SENHA.
@Component
@ConditionalOnProperty(name = "nesha.dados-de-teste", havingValue = "true")
public class DadosDeTeste implements ApplicationRunner {

    public static final String SENHA = "Nesha@123";
    public static final String EMAIL_CLIENTE = "cliente@example.com";

    private static final Logger log = LoggerFactory.getLogger(DadosDeTeste.class);

    // servico precisa ser igual ao título do serviço no catálogo do app. preco null = "a combinar".
    record Prestador(
            String nome,
            String email,
            String servico,
            String area,
            BigDecimal preco,
            UnidadePreco unidade,
            List<Integer> dias,
            String tempoResposta,
            String sobreMim,
            List<String> especialidades) {}

    private static final List<Integer> SEG_A_SEX = List.of(1, 2, 3, 4, 5);
    private static final List<Integer> SEG_A_SAB = List.of(1, 2, 3, 4, 5, 6);
    private static final List<Integer> TODOS = List.of();

    static final List<Prestador> PRESTADORES = List.of(
            p("Aline Souza", "aline", "Limpeza Residencial", "São Paulo - Centro e Zona Sul", "160", UnidadePreco.DIA, SEG_A_SAB,
                    "Menos de 1 hora", "Diarista há 10 anos, caprichosa e pontual. Levo meus próprios panos e cuidado com cada detalhe da casa.",
                    "Faxina completa", "Limpeza de cozinha e banheiros", "Organização de ambientes"),
            p("Juliana Ribeiro", "juliana", "Limpeza Residencial", "São Paulo - Zona Oeste", "130", UnidadePreco.DIA, SEG_A_SEX,
                    "Cerca de 2 horas", "Faço faxina padrão e pesada em casas e apartamentos, com foco em higienização.",
                    "Faxina pesada", "Limpeza de vidros", "Passar pano em pisos delicados"),
            p("Roberto Almeida", "roberto", "Limpeza reforçada (pós obra)", "São Paulo - Todas as regiões", "350", UnidadePreco.SERVICO, SEG_A_SAB,
                    "Menos de 1 hora", "Especialista em limpeza pós-obra: removo restos de tinta, cimento e poeira fina.",
                    "Remoção de resíduos de obra", "Limpeza de vidros e esquadrias", "Lavagem de pisos"),
            p("Sandra Moreira", "sandra", "Limpeza reforçada (pós obra)", "São Paulo - Zona Norte", null, UnidadePreco.SERVICO, SEG_A_SEX,
                    "Cerca de 3 horas", "Orço cada limpeza conforme o tamanho da obra. Equipe de duas pessoas.",
                    "Limpeza pós-reforma", "Higienização completa"),
            p("Camila Fernandes", "camila", "Organizador Profissional", "São Paulo - Zona Sul e Oeste", "180", UnidadePreco.DIA, SEG_A_SEX,
                    "Menos de 1 hora", "Personal organizer: deixo armários, closets e despensas práticos para o dia a dia.",
                    "Organização de closets", "Despensa e cozinha", "Mudanças"),
            p("Patrícia Lopes", "patricia", "Organizador Profissional", "São Paulo - Centro", "200", UnidadePreco.DIA, SEG_A_SAB,
                    "Cerca de 2 horas", "Organização de ambientes com técnicas de otimização de espaço e etiquetagem.",
                    "Organização de guarda-roupas", "Home office"),
            p("Beatriz Costa", "beatriz", "Passadeira e Lavadeira", "São Paulo - Zona Sul", "110", UnidadePreco.DIA, SEG_A_SAB,
                    "Menos de 1 hora", "Cuido das suas roupas com carinho: lavo, passo e deixo tudo dobrado no armário.",
                    "Roupas sociais", "Roupas de cama", "Peças delicadas"),
            p("Marlene Duarte", "marlene", "Passadeira e Lavadeira", "São Paulo - Zona Leste", "100", UnidadePreco.DIA, SEG_A_SEX,
                    "Cerca de 2 horas", "Passadeira há 15 anos, atendo casas e pequenos escritórios.",
                    "Passar camisas", "Lavagem à mão"),
            p("Thiago Martins", "thiago", "Limpeza e Manutenção de Piscinas", "São Paulo - Zona Sul e Oeste", "150", UnidadePreco.SERVICO, SEG_A_SAB,
                    "Menos de 1 hora", "Piscineiro com curso de tratamento de água. Deixo sua piscina cristalina.",
                    "Tratamento químico", "Aspiração e escovação", "Limpeza de filtros"),
            p("Eduardo Pires", "eduardo", "Limpeza e Manutenção de Piscinas", "Grande São Paulo", "170", UnidadePreco.SERVICO, TODOS,
                    "Cerca de 2 horas", "Manutenção semanal ou avulsa de piscinas residenciais e de condomínio.",
                    "Manutenção semanal", "Troca de areia do filtro"),
            p("Marcos Vieira", "marcos", "Eletricista Residencial", "São Paulo - Zona Norte e Centro", "90", UnidadePreco.HORA, SEG_A_SAB,
                    "Menos de 1 hora", "Eletricista com NR-10. Instalações, reparos e quadros de distribuição.",
                    "Troca de disjuntores", "Instalação de chuveiros", "Luminárias"),
            p("Rafael Gomes", "rafael", "Eletricista Residencial", "São Paulo - Zona Oeste", "100", UnidadePreco.HORA, SEG_A_SEX,
                    "Cerca de 2 horas", "Atendo emergências elétricas e faço revisão completa da instalação.",
                    "Curto-circuito", "Tomadas e interruptores"),
            p("José Carvalho", "jose", "Encanador", "São Paulo - Zona Leste", "80", UnidadePreco.HORA, SEG_A_SAB,
                    "Menos de 1 hora", "Encanador com 20 anos de experiência em vazamentos e desentupimentos.",
                    "Vazamentos", "Desentupimento", "Troca de registros"),
            p("Paulo Henrique", "paulo", "Encanador", "São Paulo - Centro e Zona Sul", "95", UnidadePreco.HORA, TODOS,
                    "Cerca de 2 horas", "Reparos hidráulicos em geral, inclusive aos fins de semana.",
                    "Caixas d'água", "Instalação de torneiras"),
            p("Antônio Ferreira", "antonio", "Pintor Residencial", "São Paulo - Zona Sul", "120", UnidadePreco.DIA, SEG_A_SAB,
                    "Cerca de 2 horas", "Pintura interna e externa com acabamento caprichado e proteção dos móveis.",
                    "Pintura interna", "Textura e grafiato", "Massa corrida"),
            p("Lucas Barbosa", "lucas", "Pintor Residencial", "São Paulo - Zona Oeste e Centro", "140", UnidadePreco.DIA, SEG_A_SEX,
                    "Menos de 1 hora", "Pinto apartamentos e casas, com orçamento sem compromisso.",
                    "Pintura de fachadas", "Portões e grades"),
            p("Sérgio Nascimento", "sergio", "Gesseiro", "São Paulo - Todas as regiões", "250", UnidadePreco.DIA, SEG_A_SAB,
                    "Cerca de 3 horas", "Forros, sancas e divisórias de drywall com acabamento fino.",
                    "Forro de gesso", "Sancas", "Drywall"),
            p("Wagner Teixeira", "wagner", "Gesseiro", "São Paulo - Zona Norte", null, UnidadePreco.SERVICO, SEG_A_SEX,
                    "Cerca de 2 horas", "Faço orçamento conforme a metragem. Reparo trincas e buracos no gesso.",
                    "Reparo de gesso", "Molduras decorativas"),
            p("Francisco Oliveira", "francisco", "Pedreiro", "São Paulo - Zona Sul e Oeste", "200", UnidadePreco.DIA, SEG_A_SAB,
                    "Menos de 1 hora", "Pedreiro para pequenas reformas, assentamento de pisos e reparos em alvenaria.",
                    "Assentamento de pisos", "Reboco", "Pequenas reformas"),
            p("Gilberto Santos", "gilberto", "Pedreiro", "São Paulo - Zona Leste", "220", UnidadePreco.DIA, SEG_A_SEX,
                    "Cerca de 2 horas", "Construção e reforma de muros, calçadas e banheiros.",
                    "Reforma de banheiro", "Muros e calçadas"),
            p("Diego Rocha", "diego", "Montador de Móveis", "São Paulo - Centro e Zona Norte", "70", UnidadePreco.SERVICO, SEG_A_SAB,
                    "Menos de 1 hora", "Monto e desmonto móveis de todas as marcas, com ferramentas próprias.",
                    "Guarda-roupas", "Cozinhas planejadas", "Desmontagem para mudança"),
            p("Felipe Araújo", "felipe", "Montador de Móveis", "São Paulo - Zona Sul", "85", UnidadePreco.SERVICO, TODOS,
                    "Cerca de 2 horas", "Montagem rápida e cuidadosa, inclusive aos domingos.",
                    "Camas e estantes", "Fixação de painéis de TV"),
            p("Ricardo Mendes", "ricardo", "Chaveiro", "São Paulo - Todas as regiões", "60", UnidadePreco.SERVICO, TODOS,
                    "Menos de 1 hora", "Chaveiro 24 horas: abertura de portas, cópias e troca de fechaduras.",
                    "Abertura de portas", "Troca de fechaduras", "Cópia de chaves"),
            p("Vinícius Castro", "vinicius", "Chaveiro", "São Paulo - Zona Oeste", "75", UnidadePreco.SERVICO, SEG_A_SAB,
                    "Cerca de 2 horas", "Instalação de fechaduras digitais e tetras.",
                    "Fechaduras digitais", "Abertura de cofres"),
            p("André Cardoso", "andre", "Instalação de Redes e Telas de Proteção", "São Paulo - Zona Sul e Centro", "150", UnidadePreco.SERVICO, SEG_A_SAB,
                    "Menos de 1 hora", "Instalo redes de proteção certificadas para janelas, sacadas e piscinas.",
                    "Redes para sacadas", "Telas mosquiteiras", "Proteção para pets"),
            p("Rodrigo Nunes", "rodrigo", "Instalação de Redes e Telas de Proteção", "São Paulo - Zona Norte e Leste", "160", UnidadePreco.SERVICO, SEG_A_SEX,
                    "Cerca de 2 horas", "Medição gratuita e instalação no mesmo dia.",
                    "Redes para janelas", "Troca de redes antigas"),
            p("Helena Prado", "helena", "Cozinheiro Doméstico", "São Paulo - Zona Oeste", "150", UnidadePreco.DIA, SEG_A_SEX,
                    "Menos de 1 hora", "Cozinheira de forno e fogão: preparo marmitas da semana e refeições do dia.",
                    "Marmitas congeladas", "Comida caseira", "Cardápio fitness"),
            p("Rosana Freitas", "rosana", "Cozinheiro Doméstico", "São Paulo - Zona Sul", "170", UnidadePreco.DIA, SEG_A_SAB,
                    "Cerca de 2 horas", "Faço cardápios personalizados, inclusive vegetarianos e sem glúten.",
                    "Cozinha vegetariana", "Festas pequenas"),
            p("Marta Rocha", "marta", "Jardineiro", "São Paulo - Centro e Zona Norte", "120", UnidadePreco.DIA, List.of(1, 3, 5),
                    "Cerca de 2 horas", "Trabalho focado em hortas e pequenos jardins residenciais.",
                    "Manutenção de jardim", "Poda leve", "Hortas"),
            p("Carlos Eduardo", "carlos", "Jardineiro", "São Paulo - Todas as regiões", "150", UnidadePreco.DIA, SEG_A_SEX,
                    "Menos de 1 hora", "Jardineiro e paisagista: poda, roçagem, replantio e manutenção de gramados.",
                    "Poda de árvores e arbustos", "Roçagem e limpeza de terreno", "Paisagismo"),
            p("Fábio Monteiro", "fabio", "Controle de Pragas", "São Paulo - Todas as regiões", "190", UnidadePreco.SERVICO, SEG_A_SAB,
                    "Menos de 1 hora", "Dedetização com produtos registrados na Anvisa e garantia de 90 dias.",
                    "Baratas e formigas", "Cupins", "Roedores"),
            p("Leandro Batista", "leandro", "Controle de Pragas", "São Paulo - Zona Leste e Centro", "210", UnidadePreco.SERVICO, SEG_A_SEX,
                    "Cerca de 2 horas", "Controle de pragas residencial e de condomínios, com laudo técnico.",
                    "Descupinização", "Desratização"));

    private static Prestador p(String nome, String usuario, String servico, String area, String preco, UnidadePreco unidade,
            List<Integer> dias, String tempoResposta, String sobreMim, String... especialidades) {
        return new Prestador(nome, usuario + "@example.com", servico, area, preco == null ? null : new BigDecimal(preco),
                unidade, dias, tempoResposta, sobreMim, List.of(especialidades));
    }

    private final UsuarioRepository usuarioRepository;
    private final ClienteService clienteService;
    private final PrestadorService prestadorService;

    public DadosDeTeste(UsuarioRepository usuarioRepository, ClienteService clienteService, PrestadorService prestadorService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteService = clienteService;
        this.prestadorService = prestadorService;
    }

    @Override
    public void run(ApplicationArguments args) {
        int criadas = 0;
        if (!usuarioRepository.existsByEmailIgnoreCase(EMAIL_CLIENTE)) {
            clienteService.cadastrar(new CadastroClienteRequest(
                    "Mariana Oliveira", cpf(0), "11987654321", EMAIL_CLIENTE, SENHA,
                    new EnderecoRequest("04538133", "Rua das Flores", "123", "Apto 42", "Itaim Bibi", "São Paulo", "SP")));
            criadas++;
        }
        for (int i = 0; i < PRESTADORES.size(); i++) {
            Prestador p = PRESTADORES.get(i);
            if (usuarioRepository.existsByEmailIgnoreCase(p.email())) {
                continue;
            }
            prestadorService.cadastrar(new CadastroPrestadorRequest(
                    p.nome(), cpf(i + 1), String.format("119%08d", 70000000 + i), p.email(), SENHA,
                    new EnderecoRequest("01310100", "Avenida Paulista", String.valueOf(100 + i), null, "Bela Vista", "São Paulo", "SP"),
                    p.servico(), p.area(), p.sobreMim(), p.preco(), p.unidade(), p.tempoResposta(), p.especialidades(), p.dias()));
            criadas++;
        }
        if (criadas > 0) {
            log.info("Dados de teste: {} conta(s) criada(s) (ver docs/CONTAS_DE_TESTE.md).", criadas);
        }
    }

    // CPF válido e fixo para cada conta (base 123450000 + n, com os dígitos verificadores calculados).
    public static String cpf(int n) {
        int[] d = new int[11];
        String base = String.format("%09d", 123450000 + n);
        for (int i = 0; i < 9; i++) {
            d[i] = base.charAt(i) - '0';
        }
        for (int tamanho = 9; tamanho <= 10; tamanho++) {
            int soma = 0;
            for (int i = 0; i < tamanho; i++) {
                soma += d[i] * (tamanho + 1 - i);
            }
            int resto = (soma * 10) % 11;
            d[tamanho] = resto == 10 ? 0 : resto;
        }
        StringBuilder cpf = new StringBuilder();
        for (int digito : d) {
            cpf.append(digito);
        }
        return cpf.toString();
    }
}
