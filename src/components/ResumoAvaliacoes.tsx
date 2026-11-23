import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type ResumoAvaliacoesProps = {
  nota: number | null;
  avaliacoes: number;
  porNota: Record<string, number>; // chave "1" a "5"
};

// Nota média, estrelas e barras por nota (perfil-prestador e todas-avaliacoes no Figma).
export function ResumoAvaliacoes({ nota, avaliacoes, porNota }: ResumoAvaliacoesProps) {
  if (nota == null) {
    return <Text style={styles.vazio}>Este profissional ainda não recebeu avaliações.</Text>;
  }

  const notaTexto = nota.toFixed(1).replace('.', ',');

  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`Nota ${notaTexto} de 5, ${avaliacoes} ${avaliacoes === 1 ? 'avaliação' : 'avaliações'}`}
    >
      <View style={styles.nota}>
        <Text style={styles.notaGrande}>{notaTexto}</Text>
        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map((estrela) => (
            <Feather
              key={estrela}
              name="star"
              size={14}
              color={estrela <= Math.round(nota) ? colors.star : colors.border}
            />
          ))}
        </View>
        <Text style={styles.total}>
          {avaliacoes} {avaliacoes === 1 ? 'avaliação' : 'avaliações'}
        </Text>
      </View>

      <View style={styles.barras}>
        {[5, 4, 3, 2, 1].map((n) => {
          const quantidade = porNota[String(n)] ?? 0;
          const largura = avaliacoes > 0 ? `${(quantidade / avaliacoes) * 100}%` : '0%';
          return (
            <View key={n} style={styles.barra}>
              <Text style={styles.rotulo}>{n} {n === 1 ? 'estrela' : 'estrelas'}</Text>
              <View style={styles.trilho}>
                <View style={[styles.preenchido, { width: largura as `${number}%` }]} />
              </View>
              <Text style={styles.numero}>{quantidade}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vazio: {
    fontSize: 13,
    color: colors.textMuted,
  },
  linha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nota: {
    alignItems: 'center',
    marginRight: 16,
  },
  notaGrande: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  estrelas: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  total: {
    fontSize: 12,
    color: colors.textMuted,
  },
  barras: {
    flex: 1,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rotulo: {
    fontSize: 10,
    color: colors.textMuted,
    width: 50,
  },
  trilho: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  preenchido: {
    height: 6,
    backgroundColor: colors.star,
    borderRadius: 3,
  },
  numero: {
    fontSize: 10,
    color: colors.text,
    width: 16,
    textAlign: 'right',
  },
});
