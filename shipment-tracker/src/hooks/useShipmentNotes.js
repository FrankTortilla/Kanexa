'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useShipmentNotes(shipmentId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!shipmentId || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipment_notes')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    if (!shipmentId || !supabase) return;
    fetchNotes();

    const channel = supabase
      .channel(`notes-${shipmentId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipment_notes', filter: `shipment_id=eq.${shipmentId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => {
              if (prev.some(n => n.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [shipmentId, fetchNotes]);

  const addNote = useCallback(async (noteText) => {
    if (!shipmentId || !noteText.trim() || !supabase) return;
    const { data, error } = await supabase
      .from('shipment_notes')
      .insert([{ shipment_id: shipmentId, note_text: noteText.trim() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [shipmentId]);

  return { notes, loading, addNote };
}
