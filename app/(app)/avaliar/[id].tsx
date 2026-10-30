import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../../src/components/Avatar';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  avaliarAgendamento,
  DESTAQUES_AVALIACAO,
} from '../../../src/data/agendamentos';
import { useAgendamento } from '../../../src/data/useAgendamentos';
import { colors } from '../../../src/theme/colors';

const ROTULOS: Record<number, string> = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Muito bom',
  5: 'Excelente',
};

export default function AvaliarServico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useAgendamento(id);

  const [nota, setNota] = useState(5);
  const [destaques, setDestaques] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Avaliar Serviço" />
        <Text style={styles.empty}>Agendamento não encontrado.</Text>
      </SafeAreaView>
    );
  }

  function alternarDestaque(destaque: string) {
    setDestaques((atual) =>
      atual.includes(destaque)
        ? atual.filter((d) => d !== destaque)
        : [...atual, destaque]
    );
  }

  function enviar() {
    avaliarAgendamento(item!.id, {
      nota,
      destaques,
      comentario: comentario.trim(),
    });
    Alert.alert('Obrigado!', 'Sua avaliação foi enviada.', [
      { text: 'OK', onPress: () => router.replace('/agenda' as Href) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Avaliar Serviço" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.center}>
            <Avatar nome={item.prestador.nome} size={64} />
            <Text style={styles.name}>{item.prestador.nome}</Text>
            <Text style={styles.sub}>
              {item.servico} realizada em {item.dataCurta}
            </Text>
          </Card>

          <Card style={styles.center}>
            <Text style={styles.section}>Como foi a sua experiência?</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((valor) => (
                <TouchableOpacity
                  key={valor}
                  onPress={() => setNota(valor)}
                  hitSlop={{ top: 9, bottom: 9, left: 9, right: 9 }}
                  accessibilityRole="radio"
                  accessibilityLabel={`Nota ${valor} de 5`}
                  accessibilityState={{ checked: valor === nota }}
                >
                  <Ionicons
                    name={valor <= nota ? 'star' : 'star-outline'}
                    size={30}
                    color={colors.star}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.rating}>
              {ROTULOS[nota]}! Nota {nota}
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionLeft}>O que mais se destacou?</Text>
            <View style={styles.tags}>
              {DESTAQUES_AVALIACAO.map((destaque) => {
                const selecionado = destaques.includes(destaque);
                return (
                  <TouchableOpacity
                    key={destaque}
                    activeOpacity={0.8}
                    onPress={() => alternarDestaque(destaque)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selecionado }}
                    style={[styles.tag, selecionado && styles.tagSelected]}
                  >
                    <Text
                      style={[styles.tagText, selecionado && styles.tagTextSelected]}
                    >
                      {destaque}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionLeft}>Escreva um comentário (opcional)</Text>
            <TextInput
              style={styles.textarea}
              value={comentario}
              onChangeText={setComentario}
              placeholder="Conte como foi o serviço..."
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
          </Card>

          <Button title="Enviar Avaliação" onPress={enviar} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
  },
  center: {
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  sectionLeft: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  tagText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tagTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  textarea: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.primarySoft,
  },
});
