import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { mockServices } from '../../src/utils/mocks';
import ServiceListItem from '../../src/components/ServiceListItem';

export default function ServicosScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<{ serviceId?: string; ids: string[] }>(() => ({
    serviceId,
    ids: serviceId ? [serviceId] : [],
  }));
  const selectedIds = selection.serviceId === serviceId
    ? selection.ids
    : serviceId ? [serviceId] : [];
  const selectedServices = mockServices.filter((service) => selectedIds.includes(service.id));
  const filteredServices = mockServices.filter((service) =>
    service.title.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))
  );

  const toggleService = (id: string) => {
    setSelection({
      serviceId,
      ids: selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    });
  };

  const viewProfessionals = () => {
    if (selectedIds.length === 0) return;
    router.push({ pathname: '/lista-profissionais', params: { serviceIds: selectedIds.join(',') } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Todos os Serviços</Text>
        </View>

        <Text style={styles.subtitle}>
          Encontre os profissionais mais qualificados de forma rápida e segura.
        </Text>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput 
            placeholder="O que você precisa hoje?" 
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Lista de Serviços */}
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ServiceListItem
              service={item}
              selected={selectedIds.includes(item.id)}
              onToggleSelected={() => toggleService(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>}
        />
        <View style={styles.selectionFooter}>
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionTitle}>
              {selectedServices.length === 0 ? 'Nenhum serviço selecionado' : `${selectedServices.length} serviço${selectedServices.length === 1 ? '' : 's'} selecionado${selectedServices.length === 1 ? '' : 's'}`}
            </Text>
            {selectedServices.length > 0 && (
              <Text style={styles.selectionNames}>
                {selectedServices.map((service) => service.title).join(' · ')}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.continueButton, selectedServices.length === 0 && styles.continueButtonDisabled]}
            onPress={viewProfessionals}
            disabled={selectedServices.length === 0}
            accessibilityRole="button"
            accessibilityState={{ disabled: selectedServices.length === 0 }}
          >
            <Text style={styles.continueButtonText}>Ver profissionais</Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 24,
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
  listContent: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 32,
  },
  selectionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    paddingBottom: 10,
  },
  selectionSummary: {
    marginBottom: 12,
  },
  selectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectionNames: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});