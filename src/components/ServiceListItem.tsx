import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { Service } from '../utils/mocks';
import { useRouter } from 'expo-router';

interface Props {
  service: Service;
  selected: boolean;
  onToggleSelected: () => void;
}

export default function ServiceListItem({ service, selected, onToggleSelected }: Props) {
  // Estado para controlar se o cartão está aberto ou fechado
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={onToggleSelected}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          accessibilityLabel={`Selecionar ${service.title}`}
        >
          <Feather name={selected ? 'check-square' : 'square'} size={22} color={selected ? colors.primary : colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.price}>{service.basePrice}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
          accessibilityRole="button"
          accessibilityLabel={`${isExpanded ? 'Recolher' : 'Expandir'} detalhes de ${service.title}`}
        >
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted || '#888'}
          />
        </TouchableOpacity>
      </View>

      {/* Conteúdo que só aparece se estiver expandido */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {service.image && (
            <Image source={service.image} style={styles.image} resizeMode="cover" />
          )}

          {service.description && (
            <Text style={styles.description}>{service.description}</Text>
          )}
          
          {service.includedItems && service.includedItems.length > 0 && (
            <View style={styles.includesContainer}>
              <Text style={styles.includesTitle}>Pode incluir</Text>
              {service.includedItems.map((item, index) => (
                <View key={index} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {service.suggestedPrice && (
            <View style={styles.suggestedPriceRow}>
              <Text style={styles.suggestedPriceLabel}>Preço médio sugerido</Text>
              <Text style={styles.suggestedPriceValue}>
                R$ {service.suggestedPrice.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/lista-profissionais')}
          >
            <Text style={styles.buttonText}>Ver profissionais</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border || '#EAEAEA',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 36,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  expandButton: {
    width: 32,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: colors.border || '#EAEAEA',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  includesContainer: {
    marginBottom: 16,
  },
  includesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  suggestedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  suggestedPriceLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  suggestedPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});