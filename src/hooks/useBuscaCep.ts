import { useRef, useState } from 'react';
import { buscarCep, CepNotFoundError, type Endereco } from '../services/viacep';

// Consulta o ViaCEP e ignora respostas de um CEP que a pessoa já trocou.
export function useBuscaCep(onEncontrado: (endereco: Endereco) => void) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const ultimoCep = useRef('');

  async function buscar(cep: string) {
    ultimoCep.current = cep;
    setCarregando(true);
    setErro('');

    try {
      const endereco = await buscarCep(cep);
      if (ultimoCep.current === cep) {
        onEncontrado(endereco);
      }
    } catch (error) {
      if (ultimoCep.current !== cep) return;
      setErro(
        error instanceof CepNotFoundError
          ? 'CEP não encontrado. Confira o número ou preencha o endereço manualmente.'
          : 'Não foi possível consultar o CEP. Preencha o endereço manualmente.'
      );
    } finally {
      if (ultimoCep.current === cep) {
        setCarregando(false);
      }
    }
  }

  // Chamar quando o CEP fica incompleto: cancela a consulta em andamento.
  function cancelar() {
    ultimoCep.current = '';
    setCarregando(false);
    setErro('');
  }

  return { carregando, erro, buscar, cancelar };
}
