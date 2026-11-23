import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { chaveDoDia, DIAS_CURTOS, mesEAno, somarDias } from '../utils/datas';

type SeletorDeDiasProps = {
  primeiroDia: Date; // primeiro dia visível
  selecionado: string; // chave "YYYY-MM-DD"
  onSelecionar: (chave: string) => void;
  onMudarPagina: (primeiroDia: Date) => void;
  quantidade?: number;
  primeiroPermitido?: Date; // não volta antes deste dia
  desabilitado?: (dia: Date) => boolean;
  comCompromisso?: (chave: string) => boolean; // bolinha embaixo do número
  acao?: { titulo: string; onPress: () => void }; // ex.: "Hoje"
};

// Faixa de dias com mês e setas (telas agenda-contratacao e agenda do prestador no Figma).
export function SeletorDeDias({
  primeiroDia,
  selecionado,
  onSelecionar,
  onMudarPagina,
  quantidade = 5,
  primeiroPermitido,
  desabilitado,
  comCompromisso,
  acao,
}: SeletorDeDiasProps) {
  const dias = Array.from({ length: quantidade }, (_, i) => somarDias(primeiroDia, i));
  const podeVoltar = !primeiroPermitido || primeiroDia > primeiroPermitido;

  function voltar() {
    const anterior = somarDias(primeiroDia, -quantidade);
    onMudarPagina(primeiroPermitido && anterior < primeiroPermitido ? primeiroPermitido : anterior);
  }

  return (
    <View>
      <View style={styles.topo}>
        <Text style={styles.mes} accessibilityRole="header">
          {mesEAno(dias.find((d) => chaveDoDia(d) === selecionado) ?? primeiroDia)}
        </Text>
        <View style={styles.setas}>
          {!!acao && (
            <TouchableOpacity
              onPress={acao.onPress}
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text style={styles.acao}>{acao.titulo}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={voltar}
            disabled={!podeVoltar}
            accessibilityRole="button"
            accessibilityLabel="Dias anteriores"
            accessibilityState={{ disabled: !podeVoltar }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={podeVoltar ? colors.primary : colors.border}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMudarPagina(somarDias(primeiroDia, quantidade))}
            accessibilityRole="button"
            accessibilityLabel="Próximos dias"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dias}>
        {dias.map((dia) => {
          const chave = chaveDoDia(dia);
          const ativo = chave === selecionado;
          const bloqueado = desabilitado?.(dia) ?? false;
          return (
            <TouchableOpacity
              key={chave}
              style={[styles.dia, ativo && styles.diaAtivo, bloqueado && styles.diaBloqueado]}
              onPress={() => onSelecionar(chave)}
              disabled={bloqueado}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${DIAS_CURTOS[dia.getDay()]}, dia ${dia.getDate()}${bloqueado ? ', sem atendimento' : ''}`}
              accessibilityState={{ selected: ativo, disabled: bloqueado }}
            >
              <Text style={[styles.sigla, ativo && styles.textoAtivo, bloqueado && styles.textoBloqueado]}>
                {DIAS_CURTOS[dia.getDay()]}
              </Text>
              <Text style={[styles.numero, ativo && styles.textoAtivo, bloqueado && styles.textoBloqueado]}>
                {dia.getDate()}
              </Text>
              <View
                style={[
                  styles.marca,
                  comCompromisso?.(chave) && (ativo ? styles.marcaAtiva : styles.marcaVisivel),
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mes: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  setas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  acao: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  dias: {
    flexDirection: 'row',
    gap: 8,
  },
  dia: {
    flex: 1,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  diaAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaBloqueado: {
    backgroundColor: colors.background,
  },
  sigla: {
    fontSize: 12,
    color: colors.textMuted,
  },
  numero: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  textoAtivo: {
    color: colors.primaryText,
  },
  textoBloqueado: {
    color: colors.placeholder,
  },
  marca: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },
  marcaVisivel: {
    backgroundColor: colors.primary,
  },
  marcaAtiva: {
    backgroundColor: colors.primaryText,
  },
});
