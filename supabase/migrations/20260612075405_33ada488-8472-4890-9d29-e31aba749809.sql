
ALTER TABLE public.emails DROP CONSTRAINT emails_contact_id_fkey, ADD CONSTRAINT emails_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.events DROP CONSTRAINT events_contact_id_fkey, ADD CONSTRAINT events_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.interactions DROP CONSTRAINT interactions_contact_id_fkey, ADD CONSTRAINT interactions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;
ALTER TABLE public.orders DROP CONSTRAINT orders_contact_id_fkey, ADD CONSTRAINT orders_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.quotes DROP CONSTRAINT quotes_contact_id_fkey, ADD CONSTRAINT quotes_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
ALTER TABLE public.tasks DROP CONSTRAINT tasks_contact_id_fkey, ADD CONSTRAINT tasks_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
