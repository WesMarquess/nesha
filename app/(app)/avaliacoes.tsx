import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { mockProfessionals } from '../../src/utils/mocks';

// Dados fictícios das avaliações para este ecrã
const mockReviews = [
  { id: '1', initials: 'MC', name: 'Mariana Costa', time: 'Há 2 dias', tag: 'Manutenção de Jardim', rating: 5.0, text: 'O Francisco deixou meu quintal impecável. Poda, limpeza do gramado e organização dos canteiros ficaram perfeitas. Ele é muito atencioso, pontual e cuidadoso com cada detalhe.', color: '#0F5C3B' },
  { id: '2', initials: 'RA', name: 'Rodrigo Almeida', time: 'Há 1 semana', tag: 'Poda de Árvores', rating: 5.0, text: 'A poda das árvores do quintal ficou perfeita. Ele trabalhou com cuidado, tirou os galhos mais pesados sem danificar o gramado e deixou tudo limpo no final. Profissionalismo total.', color: '#27AE60' },
  { id: '3', initials: 'BO', name: 'Beatriz Oliveira', time: 'Há 2 semanas', tag: 'Roçagem e Limpeza', rating: 4.0, text: 'Ele fez uma roçagem completa do terreno e deixou o quintal muito mais arejado. O único ajuste foi a retirada do material, mas o serviço em si foi muito bem feito e o preço justo.', color: '#F2994A' },
  { id: '4', initials: 'CE', name: 'Carlos Eduardo', time: 'Há 1 mês', tag: 'Manutenção de Gramado', rating: 5.0, text: 'O gramado ficou uniforme, bem aparado e muito mais saudável. Ele também organizou os canteiros e deixou o quintal pronto para uso. Recomendo muito para quem precisa de manutenção regular.', color: '#333333' }
];

export default function AvaliacoesScreen() {
  const router = useRouter();
  const prof = mockProfessionals[0];

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
          <TouchableOpacity
            style={styles.iconButtonOutline}
            accessibilityRole="button"
            accessibilityLabel="Compartilhar avaliações"
          >
            <Feather name="share-2" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Info do Profissional */}
        <View style={styles.profInfoRow}>
          <View style={styles.profAvatarSmall}>
             <Feather name="user" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.profName}>{prof.name}</Text>
            <Text style={styles.profSubtitle}>{prof.role} • Manutenção de jardim e quintal</Text>
          </View>
        </View>

        {/* Resumo das Notas */}
        <View style={styles.summaryCard}>
          <View style={styles.ratingBigContainer}>
            <Text style={styles.ratingBig}>{prof.rating}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather key={star} name="star" size={14} color={colors.star} />
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

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity style={[styles.tag, styles.tagActive]} accessibilityRole="button" accessibilityState={{ selected: true }}>
            <Text style={styles.tagTextActive}>Mais recentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tag} accessibilityRole="button" accessibilityState={{ selected: false }}>
            <Text style={styles.tagText}>Maiores notas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tag} accessibilityRole="button" accessibilityState={{ selected: false }}>
            <Text style={styles.tagText}>Menores notas</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Lista de Avaliações */}
        <View style={styles.reviewsList}>
          {mockReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={[styles.reviewerAvatar, { backgroundColor: review.color }]}>
                    <Text style={styles.reviewerInitials}>{review.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <Text style={styles.reviewTime}>{review.time}</Text>
                  </View>
                </View>
                <View style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{review.tag}</Text>
                </View>
              </View>

              <View style={styles.reviewRatingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather key={star} name="star" size={14} color={star <= review.rating ? colors.star : colors.border} />
                ))}
                <Text style={styles.reviewRatingText}>{review.rating.toFixed(1)}</Text>
              </View>

              <Text style={styles.reviewText}>{review.text}</Text>
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
  iconButtonOutline: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5EE', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  
  profInfoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  profAvatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  profName: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 2 },
  profSubtitle: { fontSize: 12, color: colors.textMuted },

  summaryCard: { marginHorizontal: 24, backgroundColor: colors.surface, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border || '#EAEAEA', marginBottom: 24 },
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

  filtersScroll: { paddingHorizontal: 24, marginBottom: 24 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border || '#E0E0E0', marginRight: 8, backgroundColor: colors.surface, height: 36, justifyContent: 'center' },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { fontSize: 13, color: colors.textMuted },
  tagTextActive: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },

  reviewsList: { paddingHorizontal: 24, paddingBottom: 40 },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border || '#EAEAEA' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reviewerInitials: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  reviewerName: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 2 },
  reviewTime: { fontSize: 12, color: colors.textMuted },
  
  serviceTag: { backgroundColor: '#E8F5EE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  serviceTagText: { color: colors.primary, fontSize: 10, fontWeight: 'bold' },
  
  reviewRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewRatingText: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
  reviewText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
});