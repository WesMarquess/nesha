import React from 'react';
import { Redirect, Tabs, useSegments } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PULAR_LOGIN } from '../../src/config/dev';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';
import { rotaInicial } from '../../src/utils/rotas';

// Telas que já desenham a própria barra (BottomNav): a do Tabs fica escondida
// para não aparecerem duas.
const semBarraDoTabs = { tabBarStyle: { display: 'none' } } as const;

// Telas protegidas. Sem sessão, volta para o login.
export default function AppLayout() {
  const { usuario, loading } = useAuth();
  const segments = useSegments();

  // Proteção mantida do código do seu colega
  if (loading) {
    return null;
  }

  // Ao sair (ou sem sessão), cada área volta para o próprio login.
  if (!usuario && !PULAR_LOGIN) {
    return <Redirect href={segments[1] === 'prestador' ? '/login-prestador' : '/login'} />;
  }

  // O prestador só usa as telas de prestador/ (o resto é da Área do Cliente).
  if (usuario?.perfil === 'PRESTADOR' && segments[1] !== 'prestador') {
    return <Redirect href={rotaInicial('PRESTADOR')} />;
  }

  // Substituição do Stack pelo Tabs para criar a barra inferior
  return (
    <Tabs
      // Voltar segue o histórico (ex.: detalhe -> agenda), e não sempre a primeira aba.
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary, // Cor verde quando ativo
        tabBarInactiveTintColor: colors.textMuted || '#888', // Cor cinza quando inativo
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#EAEAEA',
          backgroundColor: '#FFF',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginTop: -5,
        }
      }}
    >
      {/* Aba 1: Catálogo (home) */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} />,
        }}
      />

      {/* Aba 2: Agenda */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
          ...semBarraDoTabs,
        }}
      />

      {/* Aba 3: Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
          ...semBarraDoTabs,
        }}
      />

      {/* 
        Telas Internas:
        Ao passar "href: null", essas telas não ganham um ícone novo na barra,
        mas a barra continua aparecendo quando você navega para elas.
      */}
      <Tabs.Screen name="servicos" options={{ href: null }} />
      <Tabs.Screen name="lista-profissionais" options={{ href: null }} />
      <Tabs.Screen name="profissional" options={{ href: null }} />
      <Tabs.Screen name="avaliacoes" options={{ href: null }} />
      <Tabs.Screen name="agendamento/[id]" options={{ href: null }} />
      <Tabs.Screen name="cancelar/[id]" options={{ href: null }} />
      <Tabs.Screen name="avaliar/[id]" options={{ href: null }} />
      <Tabs.Screen name="configuracoes" options={{ href: null, ...semBarraDoTabs }} />
      <Tabs.Screen name="alterar-senha" options={{ href: null }} />

      {/* Área do Prestador: navegação própria em prestador/_layout.tsx */}
      <Tabs.Screen name="prestador" options={{ href: null, ...semBarraDoTabs }} />
    </Tabs>
  );
}