import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { FiltrosProfissionaisSheet } from '../../src/components/FiltrosProfissionaisSheet';
import { mensagemDeErro } from '../../src/data/agendamentos';
import { precoDoPrestador, textoAvaliacoes } from '../../src/data/usePrestador';
import { listarPrestadores } from '../../src/services/agendamentos';
import { urlFoto } from '../../src/services/auth';
import type { PrestadorCatalogo } from '../../src/types/agendamento';
import {
  contarFiltrosAtivos,
  FILTROS_INICIAIS,
  filtrarProfissionais,
} from '../../src/utils/filtrosProfissionais';
import { mockServices } from '../../src/utils/mocks';
import {
  CriterioProfissionais,
  ESTRATEGIAS_PROFISSIONAIS,
  ordenarProfissionais,
} from '../../src/utils/ordenacaoProfissionais';

export default function ListaProfissionaisScreen() {
  const router = useRouter();
  const { serviceIds } = useLocalSearchParams<{ serviceIds?: string }>();
  const selectedServices = mockServices.filter((service) => serviceIds?.split(',').includes(service.id));
  const titulos = selectedServices.map((service) => service.title).join('|');
  const [criterio, setCriterio] = useState<CriterioProfissionais>('recomendados');
  const [prestadores, setPrestadores] = useState<PrestadorCatalogo[] | null>(null);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const filtrosAtivos = contarFiltrosAtivos(filtros);

  // O "serviço principal" do prestador usa os mesmos nomes das categorias do catálogo.
  useEffect(() => {
    let ativo = true;
    listarPrestadores(titulos ? titulos.split('|') : [])
      .then((lista) => {
        if (ativo) setPrestadores(lista);
      })
      .catch((error: unknown) => {
        if (ativo) setErro(mensagemDeErro(error, 'Não foi possível carregar os profissionais.'));
      });
    return () => {
      ativo = false;
    };
  }, [titulos]);

  const profissionais = ordenarProfissionais(filtrarProfissionais(prestadores ?? [], filtros), criterio);

  const renderCard = ({ item }: { item: PrestadorCatalogo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Avatar nome={item.nome} size={56} uri={urlFoto(item.fotoUrl)} />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.profName}>{item.nome}</Text>
          <Text style={styles.profRole}>
            {item.servicoPrincipal} • Parceiro desde {item.desde}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={14} color={colors.star} style={{ marginRight: 4 }} />
            {item.nota == null ? (
              <Text style={styles.reviewsText}>Novo profissional</Text>
            ) : (
              <>
                <Text style={styles.ratingText}>{item.nota.toFixed(1).replace('.', ',')}</Text>
                <Text style={styles.reviewsText}>({textoAvaliacoes(item.avaliacoes)})</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Atendimento</Text>
          <Text style={styles.detailValue}>{item.areaAtendimento}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valor médio</Text>
          <Text style={styles.detailValueHighlight}>{precoDoPrestador(item)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dias de atendimento</Text>
          <Text style={styles.detailValueBold}>{item.disponibilidade || 'Todos os dias'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push({ pathname: '/profissional', params: { id: item.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Visualizar perfil e agendar com ${item.nome}`}
      >
        <Text style={styles.actionButtonText}>Visualizar Perfil e Agendar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho */}
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={16} color={colors.textMuted} />
          <Text style={styles.backText}>Voltar para catálogo</Text>
        </TouchableOpacity>
        
        <View style={styles.titleRow}>
          <Text style={styles.title}>Profissionais</Text>
          <TouchableOpacity
            style={[styles.filterIcon, filtrosAtivos > 0 && styles.filterIconActive]}
            onPress={() => setFiltrosAbertos(true)}
            accessibilityRole="button"
            accessibilityLabel={filtrosAtivos > 0 ? `Filtros, ${filtrosAtivos} ativo${filtrosAtivos === 1 ? '' : 's'}` : 'Filtros'}
          >
            <Feather name="sliders" size={20} color={filtrosAtivos > 0 ? colors.primaryText : colors.primary} />
            {filtrosAtivos > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filtrosAtivos}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {selectedServices.length > 0 && (
          <Text style={styles.serviceContext}>
            Serviços selecionados: {selectedServices.map((service) => service.title).join(' · ')}
          </Text>
        )}

        {/* Filtros (Tags) */}
        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ESTRATEGIAS_PROFISSIONAIS.map((estrategia) => {
              const ativo = estrategia.key === criterio;
              return (
                <TouchableOpacity
                  key={estrategia.key}
                  style={[styles.tag, ativo && styles.tagActive]}
                  onPress={() => setCriterio(estrategia.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                >
                  <Text style={ativo ? styles.tagTextActive : styles.tagText}>{estrategia.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Lista de Profissionais */}
        <FlatList
          data={profissionais}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          ListEmptyComponent={
            erro ? (
              <Text style={styles.emptyText}>{erro}</Text>
            ) : prestadores === null ? (
              <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando profissionais" />
            ) : (
              <Text style={styles.emptyText}>
                {filtrosAtivos > 0
                  ? 'Nenhum profissional corresponde aos filtros escolhidos.'
                  : criterio === 'disponiveisHoje'
                    ? 'Nenhum profissional atende hoje.'
                    : 'Nenhum profissional disponível para este serviço ainda.'}
              </Text>
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <FiltrosProfissionaisSheet
        visivel={filtrosAbertos}
        filtros={filtros}
        servicos={selectedServices.map((service) => service.title)}
        onAplicar={(novos) => {
          setFiltros(novos);
          setFiltrosAbertos(false);
        }}
        onFechar={() => setFiltrosAbertos(false)}
      />
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
    paddingTop: 16,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  backText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  serviceContext: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 24,
    marginTop: -8,
    marginBottom: 16,
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary + '15', // Fundo verde muito claro
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconActive: {
    backgroundColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tagsContainer: {
    paddingLeft: 24,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  tagTextActive: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border || '#EAEAEA',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  cardHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  profRole: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  detailValueHighlight: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  detailValueBold: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});