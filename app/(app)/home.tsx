import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';
import { useRouter } from 'expo-router';

type Recomendado = {
  serviceId: string;
  nome: string;
  descricao: string;
  preco: string;
  icone: React.ComponentProps<typeof Feather>['name'];
};

// Serviços recomendados do Figma (tela catalogo-servicos). Os ids são os do catálogo (mocks.ts).
const RECOMENDADOS: Recomendado[] = [
  { serviceId: '2', nome: 'Limpeza Residencial', descricao: 'Faxina padrão, pesada ou pós-obra', preco: 'A partir de R$ 130', icone: 'home' },
  { serviceId: '5', nome: 'Passadeira e Lavadeira', descricao: 'Cuidado completo com suas roupas', preco: 'A partir de R$ 110', icone: 'wind' },
  { serviceId: '15', nome: 'Cozinheiro Doméstico', descricao: 'Preparo de refeições e marmitas', preco: 'A partir de R$ 150', icone: 'coffee' },
];

export default function Home() {
  const { usuario, signOut } = useAuth();
  const router = useRouter();
  const [busca, setBusca] = useState('');

  // A busca abre o catálogo completo já filtrado pelo texto digitado.
  const buscar = () => {
    const termo = busca.trim();
    router.push({ pathname: '/servicos', params: termo ? { busca: termo } : {} });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {usuario?.nome || 'Usuário'} 👋</Text>
            <Text style={styles.title}>Do que sua casa precisa?</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
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
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={buscar}
            returnKeyType="search"
            accessibilityLabel="Buscar serviços"
          />
          {!!busca.trim() && (
            <TouchableOpacity onPress={buscar} accessibilityRole="button" accessibilityLabel="Buscar">
              <Feather name="arrow-right" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
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
        
        {RECOMENDADOS.map((item) => (
          <TouchableOpacity
            key={item.serviceId}
            style={styles.serviceCard}
            accessibilityRole="button"
            accessibilityLabel={`${item.nome}, ${item.preco}`}
            onPress={() => router.push({ pathname: '/servicos', params: { serviceId: item.serviceId } })}
          >
            <View style={styles.serviceIconContainer}>
              <Feather name={item.icone} size={24} color={colors.primary} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.nome}</Text>
              <Text style={styles.serviceDesc}>{item.descricao}</Text>
              <Text style={styles.servicePrice}>{item.preco}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.border || '#CCC'} />
          </TouchableOpacity>
        ))}

        {/* Botão Ver Todos */}
        <TouchableOpacity 
          style={styles.seeAllButton} 
          onPress={() => router.push('/servicos')}
          accessibilityRole="button"
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