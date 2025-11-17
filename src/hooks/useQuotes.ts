import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Quote {
  id: string;
  user_id: string;
  contact_id?: string;
  event_id?: string;
  artist_id?: string;
  quote_number: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  total_amount: number;
  tax_amount?: number;
  vat_rate?: number;
  discount_amount?: number;
  valid_until?: string;
  terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchQuotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const quotesData: Quote[] = data.map(quote => ({
          id: quote.id,
          user_id: quote.user_id,
          contact_id: quote.contact_id || undefined,
          event_id: quote.event_id || undefined,
          artist_id: quote.artist_id || undefined,
          quote_number: quote.quote_number,
          title: quote.title,
          description: quote.description || '',
          status: quote.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
          total_amount: quote.total_amount,
          tax_amount: quote.tax_amount || 0,
          vat_rate: (quote as any).vat_rate ?? 0,
          discount_amount: quote.discount_amount || 0,
          valid_until: quote.valid_until || '',
          terms: quote.terms || '',
          notes: quote.notes || '',
          created_at: quote.created_at,
          updated_at: quote.updated_at
        }));
        setQuotes(quotesData);
      }
      setLoading(false);
    };

    fetchQuotes();
  }, [user]);

  const addQuote = async (quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          user_id: quoteData.user_id,
          contact_id: quoteData.contact_id,
          event_id: quoteData.event_id,
          artist_id: quoteData.artist_id,
          quote_number: quoteData.quote_number,
          title: quoteData.title,
          description: quoteData.description,
          status: quoteData.status,
          total_amount: quoteData.total_amount,
          tax_amount: quoteData.tax_amount,
          vat_rate: (quoteData as any).vat_rate ?? 0,
          discount_amount: quoteData.discount_amount,
          valid_until: quoteData.valid_until,
          terms: quoteData.terms,
          notes: quoteData.notes
        })
        .select()
        .single();

      if (error) throw error;

      const newQuote: Quote = {
        id: data.id,
        user_id: data.user_id,
        contact_id: data.contact_id || undefined,
        event_id: data.event_id || undefined,
        artist_id: data.artist_id || undefined,
        quote_number: data.quote_number,
        title: data.title,
        description: data.description || '',
        status: data.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
        total_amount: data.total_amount,
        tax_amount: data.tax_amount || 0,
        vat_rate: (data as any).vat_rate ?? 0,
        discount_amount: data.discount_amount || 0,
        valid_until: data.valid_until || '',
        terms: data.terms || '',
        notes: data.notes || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setQuotes(prev => [newQuote, ...prev]);
      return newQuote;
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          contact_id: updates.contact_id,
          event_id: updates.event_id,
          artist_id: updates.artist_id,
          title: updates.title,
          description: updates.description,
          status: updates.status,
          total_amount: updates.total_amount,
          tax_amount: updates.tax_amount,
          vat_rate: (updates as any).vat_rate,
          discount_amount: updates.discount_amount,
          valid_until: updates.valid_until,
          terms: updates.terms,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedQuote: Quote = {
          id: data.id,
          user_id: data.user_id,
          contact_id: data.contact_id || undefined,
          event_id: data.event_id || undefined,
          artist_id: data.artist_id || undefined,
          quote_number: data.quote_number,
          title: data.title,
          description: data.description || '',
          status: data.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
          total_amount: data.total_amount,
          tax_amount: data.tax_amount || 0,
          vat_rate: (data as any).vat_rate ?? 0,
          discount_amount: data.discount_amount || 0,
          valid_until: data.valid_until || '',
          terms: data.terms || '',
          notes: data.notes || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setQuotes(prev => prev.map(quote => 
          quote.id === id ? updatedQuote : quote
        ));
        
        return updatedQuote;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du devis:', error);
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (!error) {
      setQuotes(prev => prev.filter(quote => quote.id !== id));
    }
  };

  // Fonctions pour gérer les items des devis
  const addQuoteItem = async (quoteId: string, itemData: Omit<QuoteItem, 'id' | 'quote_id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .insert({
          quote_id: quoteId,
          name: itemData.name,
          description: itemData.description,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Quote item added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error adding quote item:', error);
      throw error;
    }
  };

  const getQuoteItems = async (quoteId: string): Promise<QuoteItem[]> => {
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching quote items:', error);
      return [];
    }
  };

  const updateQuoteItem = async (itemId: string, itemData: Partial<QuoteItem>) => {
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .update({
          name: itemData.name,
          description: itemData.description,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating quote item:', error);
      throw error;
    }
  };

  const deleteQuoteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error deleting quote item:', error);
      throw error;
    }
  };

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `DEV-${year}${month}-${timestamp}`;
  };

  return {
    quotes,
    loading,
    addQuote,
    updateQuote,
    deleteQuote,
    addQuoteItem,
    updateQuoteItem,
    deleteQuoteItem,
    getQuoteItems,
    generateQuoteNumber
  };
};