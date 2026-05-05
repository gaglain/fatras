import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

export interface ContactEngagementStats {
  contactId: string;
  contactEmail: string;
  contactName: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
  bounceRate: number;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D';
  lastEventAt?: string;
}

const computeScore = (stats: {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
}): number => {
  if (stats.totalSent === 0) return 50; // neutre pour absence de données

  const deliveryRate = stats.totalDelivered / stats.totalSent;
  const openRate = stats.totalSent > 0 ? stats.totalOpened / stats.totalSent : 0;
  const clickRate = stats.totalSent > 0 ? stats.totalClicked / stats.totalSent : 0;
  const bounceRate = stats.totalSent > 0 ? stats.totalBounced / stats.totalSent : 0;

  // Score pondéré : livraison (30%), ouvertures (30%), clics (25%), pénalité bounce (15%)
  const rawScore =
    (deliveryRate * 30) +
    (openRate * 30) +
    (clickRate * 25) +
    ((1 - bounceRate) * 15);

  // Si aucun bounce ET au moins une ouverture/livraison, garantir au moins un grade C (>=20)
  const hasPositiveSignal = stats.totalDelivered > 0 || stats.totalOpened > 0 || stats.totalClicked > 0;
  const score = Math.round(rawScore);
  const adjusted = (stats.totalBounced === 0 && hasPositiveSignal) ? Math.max(score, 45) : score;

  return Math.max(0, Math.min(100, adjusted));
};

const getGrade = (score: number): 'A' | 'B' | 'C' | 'D' => {
  if (score >= 70) return 'A';
  if (score >= 45) return 'B';
  if (score >= 20) return 'C';
  return 'D';
};

export const useContactEngagement = (contactId?: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ContactEngagementStats[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch engagement stats for a single contact
  const fetchContactStats = useCallback(async (cId: string): Promise<ContactEngagementStats | null> => {
    if (!user) return null;

    try {
      // Get contact info
      const { data: contact } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .eq('id', cId)
        .single();

      if (!contact) return null;

      const contactEmailLc = (contact.email || '').toLowerCase().trim();
      // Forme canonique pour matcher gmail.com avec +alias et points
      const canonicalize = (raw: string): string => {
        const v = (raw || '').toLowerCase().trim();
        if (!v.includes('@')) return v;
        let [local, domain] = v.split('@');
        const plus = local.indexOf('+');
        if (plus >= 0) local = local.slice(0, plus);
        if (domain === 'googlemail.com') domain = 'gmail.com';
        if (domain === 'gmail.com') local = local.replace(/\./g, '');
        return `${local}@${domain}`;
      };
      const contactCanonical = canonicalize(contactEmailLc);

      // Get analytics events for this contact (par contact_id OU par adresse email)
      let analyticsQuery = supabase
        .from('email_analytics')
        .select('event_type, created_at, event_data')
        .eq('user_id', user.id);

      // Inclure les events liés directement au contact
      const { data: eventsByContact } = await analyticsQuery
        .eq('contact_id', cId);

      const evts = eventsByContact || [];
      const totalSent = evts.filter(e => e.event_type === 'sent').length;
      const totalDelivered = evts.filter(e => e.event_type === 'delivered').length;
      const totalOpened = evts.filter(e => e.event_type === 'opened').length;
      const totalClicked = evts.filter(e => e.event_type === 'clicked').length;
      const totalBounced = evts.filter(e => e.event_type === 'bounced').length;
      const totalUnsubscribed = evts.filter(e => e.event_type === 'unsubscribed').length;

      // Croiser avec la table emails par contact_id ET par adresse (pour rattraper les emails sans contact_id)
      let emailsQuery = supabase
        .from('emails')
        .select('status, sent_at, delivered_at, opened_at, to_email, contact_id')
        .eq('user_id', user.id);

      const filters: string[] = [`contact_id.eq.${cId}`];
      if (contactEmailLc) filters.push(`to_email.ilike.%${contactEmailLc}%`);
      const { data: emailsRaw } = await emailsQuery.or(filters.join(','));
      // Filtrage canonique en mémoire pour rattraper +aliases / points gmail
      const emails = (emailsRaw || []).filter(e => {
        if (e.contact_id === cId) return true;
        return canonicalize(e.to_email || '') === contactCanonical;
      });

      const emailsSent = (emails || []).filter(e => e.sent_at).length;
      const emailsDelivered = (emails || []).filter(e => e.delivered_at || e.status === 'delivered' || e.status === 'sent').length;
      const emailsOpened = (emails || []).filter(e => e.opened_at || e.status === 'opened').length;
      const emailsBounced = (emails || []).filter(e => e.status === 'bounced' || e.status === 'failed').length;

      const finalSent = Math.max(totalSent, emailsSent);
      const finalDelivered = Math.max(totalDelivered, emailsDelivered);
      const finalOpened = Math.max(totalOpened, emailsOpened);
      const finalBounced = Math.max(totalBounced, emailsBounced);

      const score = computeScore({
        totalSent: finalSent,
        totalDelivered: finalDelivered,
        totalOpened: finalOpened,
        totalClicked,
        totalBounced: finalBounced,
      });

      const lastEvent = evts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        contactId: contact.id,
        contactEmail: contact.email || '',
        contactName: `${contact.first_name} ${contact.last_name}`,
        totalSent: finalSent,
        totalDelivered: finalDelivered,
        totalOpened: finalOpened,
        totalClicked,
        totalBounced: finalBounced,
        totalUnsubscribed,
        openRate: finalSent > 0 ? (finalOpened / finalSent) * 100 : 0,
        clickRate: finalSent > 0 ? (totalClicked / finalSent) * 100 : 0,
        deliveryRate: finalSent > 0 ? (finalDelivered / finalSent) * 100 : 0,
        bounceRate: finalSent > 0 ? (finalBounced / finalSent) * 100 : 0,
        score,
        grade: getGrade(score),
        lastEventAt: lastEvent?.created_at,
      };
    } catch (error) {
      logger.error('Error fetching contact engagement:', error);
      return null;
    }
  }, [user]);

  // Fetch stats for all contacts (for dashboard)
  const fetchAllContactStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all analytics events grouped by contact
      const { data: analyticsEvents } = await supabase
        .from('email_analytics')
        .select('contact_id, event_type, created_at')
        .eq('user_id', user.id);

      if (!analyticsEvents || analyticsEvents.length === 0) {
        setStats([]);
        return;
      }

      // Group by contact_id
      const contactMap = new Map<string, typeof analyticsEvents>();
      analyticsEvents.forEach(evt => {
        const list = contactMap.get(evt.contact_id) || [];
        list.push(evt);
        contactMap.set(evt.contact_id, list);
      });

      // Get contact details
      const contactIds = Array.from(contactMap.keys());
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .in('id', contactIds);

      const contactLookup = new Map((contacts || []).map(c => [c.id, c]));

      const results: ContactEngagementStats[] = [];
      for (const [cId, evts] of contactMap.entries()) {
        const contact = contactLookup.get(cId);
        if (!contact) continue;

        const totalSent = evts.filter(e => e.event_type === 'sent').length;
        const totalDelivered = evts.filter(e => e.event_type === 'delivered').length;
        const totalOpened = evts.filter(e => e.event_type === 'opened').length;
        const totalClicked = evts.filter(e => e.event_type === 'clicked').length;
        const totalBounced = evts.filter(e => e.event_type === 'bounced').length;
        const totalUnsubscribed = evts.filter(e => e.event_type === 'unsubscribed').length;

        const score = computeScore({ totalSent, totalDelivered, totalOpened, totalClicked, totalBounced });
        const lastEvent = evts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        results.push({
          contactId: cId,
          contactEmail: contact.email || '',
          contactName: `${contact.first_name} ${contact.last_name}`,
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          totalBounced,
          totalUnsubscribed,
          openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
          clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
          deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
          bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
          score,
          grade: getGrade(score),
          lastEventAt: lastEvent?.created_at,
        });
      }

      results.sort((a, b) => b.score - a.score);
      setStats(results);
    } catch (error) {
      logger.error('Error fetching all contact engagement stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch campaign-specific contact stats
  const fetchCampaignContactStats = useCallback(async (campaignId: string) => {
    if (!user) return [];

    try {
      const { data: events } = await supabase
        .from('email_analytics')
        .select('contact_id, event_type, created_at')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id);

      if (!events || events.length === 0) return [];

      const contactMap = new Map<string, typeof events>();
      events.forEach(evt => {
        const list = contactMap.get(evt.contact_id) || [];
        list.push(evt);
        contactMap.set(evt.contact_id, list);
      });

      const contactIds = Array.from(contactMap.keys());
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .in('id', contactIds);

      const contactLookup = new Map((contacts || []).map(c => [c.id, c]));

      const results: ContactEngagementStats[] = [];
      for (const [cId, evts] of contactMap.entries()) {
        const contact = contactLookup.get(cId);
        if (!contact) continue;

        const totalSent = evts.filter(e => e.event_type === 'sent').length;
        const totalDelivered = evts.filter(e => e.event_type === 'delivered').length;
        const totalOpened = evts.filter(e => e.event_type === 'opened').length;
        const totalClicked = evts.filter(e => e.event_type === 'clicked').length;
        const totalBounced = evts.filter(e => e.event_type === 'bounced').length;
        const totalUnsubscribed = evts.filter(e => e.event_type === 'unsubscribed').length;

        const score = computeScore({ totalSent, totalDelivered, totalOpened, totalClicked, totalBounced });

        results.push({
          contactId: cId,
          contactEmail: contact.email || '',
          contactName: `${contact.first_name} ${contact.last_name}`,
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          totalBounced,
          totalUnsubscribed,
          openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
          clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
          deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
          bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
          score,
          grade: getGrade(score),
        });
      }

      return results.sort((a, b) => b.score - a.score);
    } catch (error) {
      logger.error('Error fetching campaign contact stats:', error);
      return [];
    }
  }, [user]);

  // Auto-fetch for single contact
  useEffect(() => {
    if (contactId && user) {
      fetchContactStats(contactId).then(result => {
        if (result) setStats([result]);
      });
    }
  }, [contactId, user]);

  return {
    stats,
    loading,
    fetchContactStats,
    fetchAllContactStats,
    fetchCampaignContactStats,
  };
};
