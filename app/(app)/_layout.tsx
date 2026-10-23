import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { PULAR_LOGIN } from '../../src/config/dev';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';

// Telas protegidas. Sem sessão, volta para o login.
export default function AppLayout() {
  const { usuario, loading } = useAuth();

  // Proteção mantida do código do seu colega
  if (loading) {
    return null;
  }

  if (!usuario && !PULAR_LOGIN) {
    return <Redirect href="/login" />;
  }

  // Substituição do Stack pelo Tabs para criar a barra inferior
  return (
    <Tabs
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
        }}
      />

      {/* Aba 3: Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
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
    </Tabs>
  );
}