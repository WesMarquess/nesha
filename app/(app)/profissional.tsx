import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { ResumoAvaliacoes } from '../../src/components/ResumoAvaliacoes';
import { precoDoPrestador, usePrestador } from '../../src/data/usePrestador';
import { urlFoto } from '../../src/services/auth';

export default function ProfissionalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { prestador: prof, erro } = usePrestador(id);

  const cabecalho = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Perfil do Profissional</Text>
      <View style={styles.iconButton} />
    </View>
  );

  if (!prof) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.scrollContent}>
          {cabecalho}
          {erro ? (
            <Text style={styles.aboutText}>{erro}</Text>
          ) : (
            <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando profissional" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const especialidades = prof.especialidades.length > 0 ? prof.especialidades : [prof.servicoPrincipal];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {cabecalho}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Avatar nome={prof.nome} size={80} uri={urlFoto(prof.fotoUrl)} />
          </View>
          <Text style={styles.profName}>{prof.nome}</Text>
          <Text style={styles.profRole}>
            {prof.servicoPrincipal} desde {prof.desde} • {prof.servicosRealizados}{' '}
            {prof.servicosRealizados === 1 ? 'serviço realizado' : 'serviços realizados'}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={16} color={colors.star} style={{ marginRight: 4 }} />
            {prof.nota == null ? (
              <Text style={styles.reviewsText}>Novo profissional</Text>
            ) : (
              <>
                <Text style={styles.ratingText}>{prof.nota.toFixed(1).replace('.', ',')}</Text>
                <Text style={styles.reviewsText}>({prof.avaliacoes})</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mim</Text>
          <Text style={styles.aboutText}>
            {prof.sobreMim || 'Este profissional ainda não escreveu uma apresentação.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo para contratação</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Valor médio</Text>
            <Text style={styles.summaryValue}>{precoDoPrestador(prof)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Disponibilidade</Text>
            <Text style={styles.summaryValue}>{prof.disponibilidade || 'Todos os dias'}</Text>
          </View>
          {!!prof.tempoResposta && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tempo médio de resposta</Text>
              <Text style={styles.summaryValue}>{prof.tempoResposta}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Atendimento</Text>
            <Text style={styles.summaryValue}>{prof.areaAtendimento}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <View style={styles.reviewsSummaryCard}>
            <ResumoAvaliacoes nota={prof.nota} avaliacoes={prof.avaliacoes} porNota={prof.avaliacoesPorNota} />
          </View>
          {prof.avaliacoes > 0 && (
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push({ pathname: '/avaliacoes', params: { id: prof.id } })}
              accessibilityRole="button"
            >
              <Text style={styles.outlineButtonText}>Ver todas as avaliações</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços e especialidades</Text>
          {especialidades.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push(`/agendar/${prof.id}` as Href)}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Agendar com {prof.nome.split(' ')[0]}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  profileCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border || '#EAEAEA', marginBottom: 24 },
  avatar: { marginBottom: 16 },
  profName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  profRole: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginRight: 4 },
  reviewsText: { fontSize: 14, color: colors.textMuted },
  section: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border || '#EAEAEA', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  aboutText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: colors.textMuted, flex: 1 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'right' },
  reviewsSummaryCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  outlineButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center' },
  outlineButtonText: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6, marginRight: 12 },
  bulletText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});