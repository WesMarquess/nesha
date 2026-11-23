import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { ResumoAvaliacoes } from '../../src/components/ResumoAvaliacoes';
import { mensagemDeErro } from '../../src/data/agendamentos';
import { usePrestador } from '../../src/data/usePrestador';
import { avaliacoesDoPrestador } from '../../src/services/agendamentos';
import { urlFoto } from '../../src/services/auth';
import type { AvaliacaoPublica } from '../../src/types/agendamento';

const FILTROS = [
  { key: 'recentes', label: 'Mais recentes' },
  { key: 'maiores', label: 'Maiores notas' },
  { key: 'menores', label: 'Menores notas' },
] as const;

type Filtro = (typeof FILTROS)[number]['key'];

// "Há 2 dias", "Há 1 semana"...
function haQuanto(iso: string): string {
  const dias = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (dias === 0) return 'Hoje';
  if (dias < 7) return dias === 1 ? 'Há 1 dia' : `Há ${dias} dias`;
  if (dias < 30) return Math.floor(dias / 7) === 1 ? 'Há 1 semana' : `Há ${Math.floor(dias / 7)} semanas`;
  return Math.floor(dias / 30) <= 1 ? 'Há 1 mês' : `Há ${Math.floor(dias / 30)} meses`;
}

export default function AvaliacoesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { prestador: prof } = usePrestador(id);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPublica[] | null>(null);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('recentes');

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    avaliacoesDoPrestador(id)
      .then((lista) => {
        if (ativo) setAvaliacoes(lista);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(mensagemDeErro(error, 'Não foi possível carregar as avaliações.'));
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  // A lista já vem da mais recente para a mais antiga.
  const ordenadas = [...(avaliacoes ?? [])].sort((a, b) =>
    filtro === 'maiores' ? b.nota - a.nota : filtro === 'menores' ? a.nota - b.nota : 0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Todas as avaliações</Text>
          <View style={styles.iconButton} />
        </View>

        {prof && (
          <>
            {/* Info do Profissional */}
            <View style={styles.profInfoRow}>
              <View style={styles.profAvatarSmall}>
                <Avatar nome={prof.nome} size={40} uri={urlFoto(prof.fotoUrl)} />
              </View>
              <View>
                <Text style={styles.profName}>{prof.nome}</Text>
                <Text style={styles.profSubtitle}>{prof.servicoPrincipal}</Text>
              </View>
            </View>

            {/* Resumo das Notas */}
            <View style={styles.summaryCard}>
              <ResumoAvaliacoes nota={prof.nota} avaliacoes={prof.avaliacoes} porNota={prof.avaliacoesPorNota} />
            </View>
          </>
        )}

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {FILTROS.map(({ key, label }) => {
            const ativo = key === filtro;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.tag, ativo && styles.tagActive]}
                onPress={() => setFiltro(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Text style={ativo ? styles.tagTextActive : styles.tagText}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Lista de Avaliações */}
        <View style={styles.reviewsList}>
          {!!erro && <Text style={styles.reviewText}>{erro}</Text>}
          {avaliacoes === null && !erro && (
            <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando avaliações" />
          )}
          {avaliacoes?.length === 0 && <Text style={styles.reviewText}>Ainda não há avaliações.</Text>}

          {ordenadas.map((review, index) => (
            <View key={`${review.data}-${index}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Avatar nome={review.cliente} size={40} />
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{review.cliente}</Text>
                    <Text style={styles.reviewTime}>{haQuanto(review.data)}</Text>
                  </View>
                </View>
                <View style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{review.servico}</Text>
                </View>
              </View>

              <View
                style={styles.reviewRatingRow}
                accessible
                accessibilityLabel={`Nota ${review.nota} de 5`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather key={star} name="star" size={14} color={star <= review.nota ? colors.star : colors.border} />
                ))}
                <Text style={styles.reviewRatingText}>{review.nota.toFixed(1).replace('.', ',')}</Text>
              </View>

              {review.destaques.length > 0 && (
                <Text style={styles.destaques}>{review.destaques.join(' • ')}</Text>
              )}
              {!!review.comentario && <Text style={styles.reviewText}>{review.comentario}</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, marginBottom: 24 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  
  profInfoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  profAvatarSmall: { marginRight: 12 },
  profName: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 2 },
  profSubtitle: { fontSize: 12, color: colors.textMuted },

  summaryCard: { marginHorizontal: 24, backgroundColor: colors.surface, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border || '#EAEAEA', marginBottom: 24 },

  filtersScroll: { paddingHorizontal: 24, marginBottom: 24 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border || '#E0E0E0', marginRight: 8, backgroundColor: colors.surface, height: 36, justifyContent: 'center' },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { fontSize: 13, color: colors.textMuted },
  tagTextActive: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },

  reviewsList: { paddingHorizontal: 24, paddingBottom: 40 },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border || '#EAEAEA' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  reviewerAvatar: { marginRight: 12 },
  reviewerName: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 2 },
  reviewTime: { fontSize: 12, color: colors.textMuted },
  
  serviceTag: { backgroundColor: '#E8F5EE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  serviceTagText: { color: colors.primary, fontSize: 10, fontWeight: 'bold' },
  
  reviewRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewRatingText: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
  reviewText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  destaques: { fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: 8 },
});