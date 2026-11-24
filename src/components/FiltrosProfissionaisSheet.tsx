import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import {
  FILTROS_INICIAIS,
  FiltrosProfissionais,
  OPCOES_NOTA,
  OPCOES_PRECO,
} from '../utils/filtrosProfissionais';
import { Button } from './Button';

type Props = {
  visivel: boolean;
  filtros: FiltrosProfissionais;
  servicos: string[]; // serviços escolhidos no catálogo; com 2 ou mais, dá para filtrar por um deles
  onAplicar: (filtros: FiltrosProfissionais) => void;
  onFechar: () => void;
};

type Opcao = { key: string; label: string };

function Grupo({
  titulo,
  opcoes,
  valor,
  onChange,
}: {
  titulo: string;
  opcoes: readonly Opcao[];
  valor: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      <View style={styles.opcoes}>
        {opcoes.map((opcao) => {
          const ativo = opcao.key === valor;
          return (
            <TouchableOpacity
              key={opcao.key}
              style={[styles.chip, ativo && styles.chipAtivo]}
              onPress={() => onChange(opcao.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Folha inferior do botão "Filtros". Edita um rascunho e só aplica ao confirmar.
export function FiltrosProfissionaisSheet({ visivel, filtros, servicos, onAplicar, onFechar }: Props) {
  const [rascunho, setRascunho] = useState(filtros);
  const [abertoCom, setAbertoCom] = useState(filtros);

  // Ao reabrir com outros filtros aplicados, o rascunho recomeça deles.
  if (abertoCom !== filtros) {
    setAbertoCom(filtros);
    setRascunho(filtros);
  }

  const opcoesServico: Opcao[] = [
    { key: '', label: 'Todos' },
    ...servicos.map((servico) => ({ key: servico, label: servico })),
  ];

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar filtros" />
      <SafeAreaView edges={['bottom']} style={styles.folha}>
        <View style={styles.topo}>
          <Text style={styles.titulo} accessibilityRole="header">
            Filtros
          </Text>
          <TouchableOpacity onPress={onFechar} accessibilityRole="button" accessibilityLabel="Fechar">
            <Feather name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.conteudo}>
          <Grupo
            titulo="Avaliação mínima"
            opcoes={OPCOES_NOTA}
            valor={rascunho.notaMinima}
            onChange={(key) =>
              setRascunho({ ...rascunho, notaMinima: key as FiltrosProfissionais['notaMinima'] })
            }
          />
          <Grupo
            titulo="Valor médio"
            opcoes={OPCOES_PRECO}
            valor={rascunho.precoMaximo}
            onChange={(key) =>
              setRascunho({ ...rascunho, precoMaximo: key as FiltrosProfissionais['precoMaximo'] })
            }
          />
          {servicos.length > 1 && (
            <Grupo
              titulo="Serviço"
              opcoes={opcoesServico}
              valor={rascunho.servico}
              onChange={(key) => setRascunho({ ...rascunho, servico: key })}
            />
          )}
        </ScrollView>

        <View style={styles.botoes}>
          <View style={styles.botao}>
            <Button title="Limpar" variant="outline" onPress={() => setRascunho(FILTROS_INICIAIS)} />
          </View>
          <View style={styles.botao}>
            <Button title="Aplicar filtros" onPress={() => onAplicar(rascunho)} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  folha: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  conteudo: {
    paddingBottom: 8,
  },
  grupo: {
    marginTop: 16,
  },
  grupoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTexto: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextoAtivo: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
  },
  botao: {
    flex: 1,
  },
});
