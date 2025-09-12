-- Ajouter des identifiants lisibles pour les contacts et événements
ALTER TABLE contacts ADD COLUMN external_id TEXT;
ALTER TABLE events ADD COLUMN external_id TEXT;

-- Créer des index uniques sur ces identifiants par utilisateur
CREATE UNIQUE INDEX idx_contacts_external_id_user ON contacts(user_id, external_id) WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX idx_events_external_id_user ON events(user_id, external_id) WHERE external_id IS NOT NULL;

-- Fonction pour générer des identifiants séquentiels pour les contacts
CREATE OR REPLACE FUNCTION generate_contact_external_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Générer un ID séquentiel par utilisateur pour les contacts
    SELECT COALESCE(MAX(CAST(SUBSTRING(external_id FROM '^C([0-9]+)$') AS INTEGER)), 0) + 1
    INTO next_id
    FROM contacts 
    WHERE user_id = NEW.user_id 
    AND external_id ~ '^C[0-9]+$';
    
    NEW.external_id := 'C' || next_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des identifiants séquentiels pour les événements
CREATE OR REPLACE FUNCTION generate_event_external_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Générer un ID séquentiel par utilisateur pour les événements
    SELECT COALESCE(MAX(CAST(SUBSTRING(external_id FROM '^E([0-9]+)$') AS INTEGER)), 0) + 1
    INTO next_id
    FROM events 
    WHERE user_id = NEW.user_id 
    AND external_id ~ '^E[0-9]+$';
    
    NEW.external_id := 'E' || next_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers pour auto-générer les IDs
CREATE TRIGGER contact_external_id_trigger
    BEFORE INSERT ON contacts
    FOR EACH ROW
    WHEN (NEW.external_id IS NULL)
    EXECUTE FUNCTION generate_contact_external_id();

CREATE TRIGGER event_external_id_trigger
    BEFORE INSERT ON events
    FOR EACH ROW
    WHEN (NEW.external_id IS NULL)
    EXECUTE FUNCTION generate_event_external_id();

-- Générer des IDs pour les enregistrements existants (contacts)
DO $$
DECLARE
    contact_rec RECORD;
    counter INTEGER;
BEGIN
    FOR contact_rec IN 
        SELECT DISTINCT user_id FROM contacts WHERE external_id IS NULL
    LOOP
        counter := 1;
        FOR contact_rec IN 
            SELECT id FROM contacts 
            WHERE user_id = contact_rec.user_id AND external_id IS NULL
            ORDER BY created_at
        LOOP
            UPDATE contacts 
            SET external_id = 'C' || counter
            WHERE id = contact_rec.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Générer des IDs pour les enregistrements existants (événements)
DO $$
DECLARE
    event_rec RECORD;
    counter INTEGER;
BEGIN
    FOR event_rec IN 
        SELECT DISTINCT user_id FROM events WHERE external_id IS NULL
    LOOP
        counter := 1;
        FOR event_rec IN 
            SELECT id FROM events 
            WHERE user_id = event_rec.user_id AND external_id IS NULL
            ORDER BY created_at
        LOOP
            UPDATE events 
            SET external_id = 'E' || counter
            WHERE id = event_rec.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;