-- Ajouter la colonne probability_percentage à la table opportunities
ALTER TABLE opportunities ADD COLUMN probability_percentage INTEGER DEFAULT 50;

-- Mettre à jour le trigger pour updated_at
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();