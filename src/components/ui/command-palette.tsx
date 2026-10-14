import * as React from "react";
import { useEffect, useState } from "react";
import { Search, Hash, Calendar, Users, MessageSquare, FileText, Settings, Contact, Music, CheckSquare, Target, Receipt, Mail, Truck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Hit = { id: string; label: string; sub?: string; to: string };
type Group = { key: string; heading: string; icon: React.ComponentType<{ className?: string }>; hits: Hit[] };

const LIMIT = 6;

async function searchAll(q: string): Promise<Group[]> {
  const term = q.replace(/[%,()]/g, " ").trim();
  const p = `%${term}%`;
  const parts = term.split(/\s+/).filter(Boolean);
  const contactOr = [
    `first_name.ilike.${p}`, `last_name.ilike.${p}`, `email.ilike.${p}`, `company.ilike.${p}`, `city.ilike.${p}`,
    ...parts.flatMap((w) => [`first_name.ilike.%${w}%`, `last_name.ilike.%${w}%`]),
  ].join(",");

  const db = supabase as any;
  const [contacts, events, opps, quotes, tasks, artists, emails, stops] = await Promise.all([
    db.from("contacts").select("id,first_name,last_name,email,company").or(contactOr).limit(LIMIT),
    db.from("events").select("id,title,venue,city").or(`title.ilike.${p},venue.ilike.${p},city.ilike.${p},description.ilike.${p}`).limit(LIMIT),
    db.from("opportunities").select("id,title,venue").or(`title.ilike.${p},venue.ilike.${p},description.ilike.${p}`).limit(LIMIT),
    db.from("quotes").select("id,title,quote_number").or(`title.ilike.${p},quote_number.ilike.${p},description.ilike.${p}`).limit(LIMIT),
    db.from("tasks").select("id,title").or(`title.ilike.${p},description.ilike.${p}`).limit(LIMIT),
    db.from("centralized_artists").select("id,name").ilike("name", p).limit(LIMIT),
    db.from("emails").select("id,subject,from_name,from_email,contact_id").or(`subject.ilike.${p},from_name.ilike.${p},from_email.ilike.${p}`).order("created_at", { ascending: false }).limit(LIMIT),
    db.from("roadshow_stops").select("id,city,venue,event_date").or(`city.ilike.${p},venue.ilike.${p}`).limit(LIMIT),
  ]);

  const d = (r: any) => (r?.data || []) as any[];
  return [
    { key: "c", heading: "Contacts", icon: Contact, hits: d(contacts).map((c) => ({ id: c.id, label: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email, sub: [c.company, c.email].filter(Boolean).join(" · "), to: `/contacts/${c.id}` })) },
    { key: "e", heading: "Événements", icon: Calendar, hits: d(events).map((e) => ({ id: e.id, label: e.title, sub: [e.venue, e.city].filter(Boolean).join(" · "), to: `/events/${e.id}` })) },
    { key: "o", heading: "Opportunités", icon: Target, hits: d(opps).map((o) => ({ id: o.id, label: o.title, sub: o.venue, to: `/opportunities/${o.id}` })) },
    { key: "q", heading: "Devis", icon: Receipt, hits: d(quotes).map((q) => ({ id: q.id, label: q.title || q.quote_number, sub: q.quote_number, to: `/quotes` })) },
    { key: "t", heading: "Tâches", icon: CheckSquare, hits: d(tasks).map((t) => ({ id: t.id, label: t.title, to: `/tasks` })) },
    { key: "a", heading: "Spectacles", icon: Music, hits: d(artists).map((a) => ({ id: a.id, label: a.name, to: `/artists/${a.id}` })) },
    { key: "r", heading: "Feuilles de route", icon: Truck, hits: d(stops).map((s) => ({ id: s.id, label: [s.city, s.venue].filter(Boolean).join(" — "), sub: s.event_date ? new Date(s.event_date).toLocaleDateString("fr-FR") : undefined, to: `/roadshow` })) },
    { key: "m", heading: "Emails", icon: Mail, hits: d(emails).map((m) => ({ id: m.id, label: m.subject || "(sans objet)", sub: m.from_name || m.from_email, to: m.contact_id ? `/contacts/${m.contact_id}` : `/email` })) },
  ].filter((g) => g.hits.length > 0);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) { setGroups([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchAll(q);
        if (!cancelled) setGroups(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [searchTerm]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    setSearchTerm("");
    command();
  }, []);

  const searching = searchTerm.trim().length >= 2;

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-muted/50 hover:bg-muted transition-colors rounded-md border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Rechercher...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Contacts, événements, devis, emails, tâches..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList className="max-h-[70vh]">
          {searching && loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche…
            </div>
          )}
          {searching && !loading && groups.length === 0 && (
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          )}

          {searching && groups.map((g) => (
            <CommandGroup key={g.key} heading={g.heading}>
              {g.hits.map((h) => (
                <CommandItem key={`${g.key}-${h.id}`} value={`${g.key}-${h.id}`} onSelect={() => runCommand(() => navigate(h.to))}>
                  <g.icon className="mr-2 h-4 w-4 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{h.label}</span>
                    {h.sub && <span className="text-xs text-muted-foreground truncate">{h.sub}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {!searching && (
            <>
              <CommandGroup heading="Navigation">
                {[
                  ["/dashboard", "Dashboard", Hash],
                  ["/contacts", "Contacts", Users],
                  ["/events", "Événements", Calendar],
                  ["/opportunities", "Opportunités", Target],
                  ["/quotes", "Devis", Receipt],
                  ["/roadshow", "Feuilles de route", Truck],
                  ["/email", "Emails", Mail],
                  ["/email-campaigns", "Campagnes Email", MessageSquare],
                  ["/tasks", "Tâches", FileText],
                  ["/artists", "Spectacles", Music],
                ].map(([to, label, Icon]: any) => (
                  <CommandItem key={to} value={to} onSelect={() => runCommand(() => navigate(to))}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Thème">
                <CommandItem value="light" onSelect={() => runCommand(() => setTheme("light"))}>☀️ <span className="ml-2">Mode Clair</span></CommandItem>
                <CommandItem value="dark" onSelect={() => runCommand(() => setTheme("dark"))}>🌙 <span className="ml-2">Mode Sombre</span></CommandItem>
              </CommandGroup>
              <CommandGroup heading="Réglages">
                <CommandItem value="prefs" onSelect={() => runCommand(() => navigate("/preferences"))}>
                  <Settings className="mr-2 h-4 w-4" />
                  Préférences
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
