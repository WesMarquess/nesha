import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { mockProfessionals } from '../../src/utils/mocks';

export default function ProfissionalScreen() {
  const router = useRouter();
  const prof = mockProfessionals[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
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

        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
             <Feather name="user" size={40} color={colors.primary} />
             <View style={styles.verifiedBadge}>
               <Feather name="check" size={12} color="#FFF" />
             </View>
          </View>
          <Text style={styles.profName}>{prof.name}</Text>
          <Text style={styles.profRole}>
            {prof.role} desde {prof.memberSince} • {prof.reviewsCount} serviços realizados
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={16} color="#F2C94C" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>{prof.rating}</Text>
            <Text style={styles.reviewsText}>({prof.reviewsCount})</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mim</Text>
          <Text style={styles.aboutText}>{prof.aboutMe}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo para contratação</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Disponibilidade</Text>
            <Text style={styles.summaryValue}>{prof.availability}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tempo médio de resposta</Text>
            <Text style={styles.summaryValue}>{prof.responseTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Atendimento</Text>
            <Text style={styles.summaryValue}>{prof.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <View style={styles.reviewsSummaryCard}>
            <View style={styles.ratingBigContainer}>
              <Text style={styles.ratingBig}>{prof.rating}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather key={star} name="star" size={14} color="#F2C94C" />
                ))}
              </View>
              <Text style={styles.reviewsCountText}>{prof.reviewsCount} avaliações</Text>
            </View>
            <View style={styles.barsContainer}>
              <View style={styles.barRow}><Text style={styles.barLabel}>5 estrelas</Text><View style={styles.barTrack}><View style={[styles.barFill, { width: '85%' }]} /></View><Text style={styles.barNumber}>42</Text></View>
              <View style={styles.barRow}><Text style={styles.barLabel}>4 estrelas</Text><View style={styles.barTrack}><View style={[styles.barFill, { width: '15%' }]} /></View><Text style={styles.barNumber}>6</Text></View>
              <View style={styles.barRow}><Text style={styles.barLabel}>3 estrelas</Text><View style={styles.barTrack}><View style={[styles.barFill, { width: '0%' }]} /></View><Text style={styles.barNumber}>0</Text></View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.outlineButton} 
            onPress={() => router.push('/avaliacoes')}
            accessibilityRole="button"
          >
            <Text style={styles.outlineButtonText}>Ver todas as avaliações</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços e especialidades</Text>
          {prof.specialties.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Agendar com {prof.name.split(' ')[0]}</Text>
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
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.surface },
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
  ratingBigContainer: { alignItems: 'center', marginRight: 16 },
  ratingBig: { fontSize: 40, fontWeight: 'bold', color: colors.text },
  starsRow: { flexDirection: 'row', marginVertical: 4 },
  reviewsCountText: { fontSize: 12, color: colors.textMuted },
  barsContainer: { flex: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  barLabel: { fontSize: 10, color: colors.textMuted, width: 50 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginHorizontal: 8 },
  barFill: { height: 6, backgroundColor: colors.star, borderRadius: 3 },
  barNumber: { fontSize: 10, color: colors.text, width: 16, textAlign: 'right' },
  outlineButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center' },
  outlineButtonText: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6, marginRight: 12 },
  bulletText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});