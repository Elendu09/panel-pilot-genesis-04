-- Add foreign key constraint from services.category_id to service_categories.id
-- This ensures referential integrity between services and their categories

ALTER TABLE services 
ADD CONSTRAINT fk_services_category 
FOREIGN KEY (category_id) 
REFERENCES service_categories(id) 
ON DELETE SET NULL;