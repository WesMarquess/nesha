import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ApiError } from '../services/api';
import { enviarFoto } from '../services/auth';

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

// Abre a galeria e envia a foto escolhida para o usuário logado (cliente ou prestador).
// Na web o seletor só abre se `escolher` for chamado direto do toque no botão.
export function useFotoDePerfil() {
  const [enviando, setEnviando] = useState(false);

  // Devolve o novo fotoUrl, ou null se a pessoa cancelar. Lança Error com a mensagem para exibir.
  async function escolher(): Promise<string | null> {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (resultado.canceled || !resultado.assets?.length) {
      return null;
    }

    const asset = resultado.assets[0];
    if ((asset.fileSize ?? asset.file?.size ?? 0) > TAMANHO_MAXIMO) {
      throw new Error('A foto deve ter no máximo 5 MB.');
    }

    setEnviando(true);
    try {
      const { fotoUrl } = await enviarFoto({
        uri: asset.uri,
        nome: asset.fileName ?? 'foto.jpg',
        tipo: asset.mimeType ?? 'image/jpeg',
        file: asset.file,
      });
      return fotoUrl;
    } catch (error) {
      throw new Error(
        error instanceof ApiError ? error.message : 'Não foi possível enviar a foto. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return { enviando, escolher };
}
