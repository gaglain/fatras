-- Create table for show bible documents
CREATE TABLE IF NOT EXISTS public.show_bible_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  tags text[],
  show_id uuid,
  category text NOT NULL DEFAULT 'Autre',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_bible_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own show bible documents" 
ON public.show_bible_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own show bible documents" 
ON public.show_bible_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own show bible documents" 
ON public.show_bible_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own show bible documents" 
ON public.show_bible_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_show_bible_documents_updated_at
  BEFORE UPDATE ON public.show_bible_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_show_bible_documents_updated_at();