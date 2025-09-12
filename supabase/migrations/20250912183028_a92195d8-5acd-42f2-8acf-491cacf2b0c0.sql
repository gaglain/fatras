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

-- Générer des IDs pour les enregistrements existants
DO $$
DECLARE
    contact_rec RECORD;
    event_rec RECORD;
    contact_counter INTEGER;
    event_counter INTEGER;
BEGIN
    -- Pour chaque utilisateur, générer des IDs pour les contacts
    FOR contact_rec IN 
        SELECT DISTINCT user_id FROM contacts WHERE external_id IS NULL
    LOOP
        contact_counter := 1;
        UPDATE contacts 
        SET external_id = 'C' || (ROW_NUMBER() OVER (ORDER BY created_at))
        WHERE user_id = contact_rec.user_id AND external_id IS NULL;
    END LOOP;
    
    -- Pour chaque utilisateur, générer des IDs pour les événements
    FOR event_rec IN 
        SELECT DISTINCT user_id FROM events WHERE external_id IS NULL
    LOOP
        event_counter := 1;
        UPDATE events 
        SET external_id = 'E' || (ROW_NUMBER() OVER (ORDER BY created_at))
        WHERE user_id = event_rec.user_id AND external_id IS NULL;
    END LOOP;
END $$;