import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Quote {
  id: string;
  user_id: string;
  contact_id?: string;
  event_id?: string;
  quote_number: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  total_amount: number;
  tax_amount?: number;
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchQuotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const quotesData: Quote[] = data.map(quote => ({
          id: quote.id,
          user_id: quote.user_id,
          contact_id: quote.contact_id || undefined,
          event_id: quote.event_id || undefined,
          quote_number: quote.quote_number,
          title: quote.title,
          description: quote.description || '',
          status: quote.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
          total_amount: quote.total_amount,
          tax_amount: quote.tax_amount || 0,
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
          quote_number: quoteData.quote_number,
          title: quoteData.title,
          description: quoteData.description,
          status: quoteData.status,
          total_amount: quoteData.total_amount,
          tax_amount: quoteData.tax_amount,
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
        quote_number: data.quote_number,
        title: data.title,
        description: data.description || '',
        status: data.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
        total_amount: data.total_amount,
        tax_amount: data.tax_amount || 0,
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
    const { data, error } = await supabase
      .from('quotes')
      .update({
        contact_id: updates.contact_id,
        event_id: updates.event_id,
        title: updates.title,
        description: updates.description,
        status: updates.status,
        total_amount: updates.total_amount,
        tax_amount: updates.tax_amount,
        discount_amount: updates.discount_amount,
        valid_until: updates.valid_until,
        terms: updates.terms,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (data && !error) {
      setQuotes(prev => prev.map(quote => 
        quote.id === id ? { ...quote, ...updates } : quote
      ));
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

    return data && !error ? data : null;
  };

  const getQuoteItems = async (quoteId: string): Promise<QuoteItem[]> => {
    const { data, error } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId);

    return data && !error ? data : [];
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
    getQuoteItems,
    generateQuoteNumber
  };
};