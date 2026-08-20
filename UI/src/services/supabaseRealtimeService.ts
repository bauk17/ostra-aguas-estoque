import { supabase } from '../lib/supabase';

export function ouvirClientes(
  onInsert: (cliente: any) => void,
  onUpdate: (cliente: any) => void,
  onDelete: (cliente: any) => void,
) {
  const channel = supabase
    .channel('clientes-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'clientes',
      },
      (payload) => {
        console.log('[SUPABASE] Cliente criado:', payload.new);
        onInsert(payload.new);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'clientes',
      },
      (payload) => {
        console.log('[SUPABASE] Cliente atualizado:', payload.new);
        onUpdate(payload.new);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'clientes',
      },
      (payload) => {
        console.log('[SUPABASE] Cliente excluído:', payload.old);
        onDelete(payload.old);
      },
    )
    .subscribe((status) => {
      console.log('[SUPABASE] Realtime clientes:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}