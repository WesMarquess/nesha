import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../src/components/BottomNav';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';
import { useRouter } from 'expo-router';

export default function Home() {
  const { usuario, signOut } = useAuth();
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {usuario?.nome || 'Usuário'} 👋</Text>
            <Text style={styles.title}>Do que sua casa precisa?</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} onPress={signOut}>
            <Feather name="log-out" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput 
            placeholder="Buscar faxina, passar roupa, cozinhar..." 
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Banner de Desconto */}
        <View style={styles.banner}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>DESCONTO ESPECIAL</Text>
          </View>
          <Text style={styles.bannerTitle}>Primeira faxina com R$30 OFF</Text>
          <Text style={styles.bannerSubtitle}>Use o cupom BEMVINDO30 e agende hoje.</Text>
        </View>

        {/* Serviços Recomendados */}
        <Text style={styles.sectionTitle}>Serviços recomendados</Text>
        
        {/* Card 1 */}
        <TouchableOpacity style={styles.serviceCard} onPress={() => router.push({ pathname: '/servicos', params: { serviceId: '2' } })}>
          <View style={styles.serviceIconContainer}>
             <Feather name="home" size={24} color={colors.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Limpeza Residencial</Text>
            <Text style={styles.serviceDesc}>Faxina padrão, pesada ou pós-obra</Text>
            <Text style={styles.servicePrice}>A partir de R$ 130</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.border || '#CCC'} />
        </TouchableOpacity>

        {/* Card 2 */}
        <TouchableOpacity style={styles.serviceCard} onPress={() => router.push({ pathname: '/servicos', params: { serviceId: '5' } })}>
          <View style={styles.serviceIconContainer}>
             <Feather name="activity" size={24} color={colors.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Passadeira e Lavadeira</Text>
            <Text style={styles.serviceDesc}>Cuidado completo com suas roupas</Text>
            <Text style={styles.servicePrice}>A partir de R$ 110</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.border || '#CCC'} />
        </TouchableOpacity>

        {/* Botão Ver Todos */}
        <TouchableOpacity 
          style={styles.seeAllButton} 
          onPress={() => router.push('/servicos')}
        >
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border || '#EAEAEA',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  seeAllButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});