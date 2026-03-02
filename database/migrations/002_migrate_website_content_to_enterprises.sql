-- ===================================================================
-- MIGRAÇÃO: website_content (hotels) → enterprises
-- ===================================================================
-- Este script migra os hotéis da tabela website_content para a nova
-- estrutura de enterprises, properties e accommodations
-- ===================================================================

-- ===================================================================
-- FUNÇÃO AUXILIAR: Extrair cidade e estado de location string
-- ===================================================================
CREATE OR REPLACE FUNCTION extract_city_state(location_text TEXT)
RETURNS TABLE(city TEXT, state TEXT) AS $$
BEGIN
  IF location_text IS NULL OR location_text = '' THEN
    RETURN QUERY SELECT 'Caldas Novas'::TEXT, 'GO'::TEXT;
    RETURN;
  END IF;
  
  -- Tentar extrair cidade e estado (formato: "Cidade, Estado")
  IF location_text LIKE '%,%' THEN
    RETURN QUERY SELECT 
      TRIM(SPLIT_PART(location_text, ',', 1))::TEXT,
      UPPER(TRIM(SPLIT_PART(location_text, ',', 2)))::TEXT;
  ELSE
    -- Se não tiver vírgula, assumir que é só a cidade
    RETURN QUERY SELECT TRIM(location_text)::TEXT, 'GO'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- MIGRAÇÃO PRINCIPAL
-- ===================================================================
DO $$
DECLARE
  hotel_record RECORD;
  new_enterprise_id INTEGER;
  new_property_id INTEGER;
  new_accommodation_id INTEGER;
  city_text TEXT;
  state_text TEXT;
  images_array JSONB;
  amenities_array JSONB;
  metadata_obj JSONB;
  location_str TEXT;
  price_value DECIMAL(10, 2);
  max_guests_value INTEGER;
BEGIN
  RAISE NOTICE '🚀 Iniciando migração de hotéis...';
  
  -- Iterar sobre todos os hotéis ativos
  FOR hotel_record IN 
    SELECT * FROM website_content 
    WHERE page_type = 'hotels' 
    AND status = 'active'
    ORDER BY id
  LOOP
    BEGIN
      -- Extrair dados do metadata
      metadata_obj := COALESCE(hotel_record.metadata, '{}'::JSONB);
      location_str := COALESCE(
        metadata_obj->>'location',
        hotel_record.title || ', GO'
      );
      
      -- Extrair cidade e estado
      SELECT city, state INTO city_text, state_text
      FROM extract_city_state(location_str);
      
      -- Extrair preço
      price_value := COALESCE(
        (metadata_obj->>'price')::DECIMAL,
        (metadata_obj->>'originalPrice')::DECIMAL,
        200.00
      );
      
      -- Extrair capacidade
      max_guests_value := COALESCE(
        (metadata_obj->>'maxGuests')::INTEGER,
        CASE 
          WHEN metadata_obj->>'capacity' IS NOT NULL THEN
            (REGEXP_REPLACE(metadata_obj->>'capacity', '[^0-9]', '', 'g'))::INTEGER
          ELSE 4
        END,
        4
      );
      
      -- Preparar arrays
      images_array := COALESCE(hotel_record.images, '[]'::JSONB);
      amenities_array := COALESCE(
        metadata_obj->'features',
        '[]'::JSONB
      );
      
      -- Se features não for array, tentar converter
      IF jsonb_typeof(amenities_array) != 'array' THEN
        amenities_array := '[]'::JSONB;
      END IF;
      
      -- 1. Criar Enterprise
      INSERT INTO enterprises (
        name,
        description,
        enterprise_type,
        address_city,
        address_state,
        address_country,
        phone,
        email,
        website,
        images,
        amenities,
        status,
        is_featured,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        hotel_record.title,
        COALESCE(hotel_record.description, ''),
        'hotel',
        city_text,
        state_text,
        'Brasil',
        COALESCE((metadata_obj->>'phone'), NULL),
        COALESCE((metadata_obj->>'email'), NULL),
        COALESCE((metadata_obj->>'website'), NULL),
        images_array,
        amenities_array,
        CASE 
          WHEN hotel_record.status = 'active' THEN 'active'
          ELSE 'inactive'
        END,
        COALESCE((metadata_obj->>'featured')::BOOLEAN, false),
        jsonb_build_object(
          'migrated_from', 'website_content',
          'original_id', hotel_record.id,
          'original_content_id', hotel_record.content_id,
          'stars', COALESCE((metadata_obj->>'stars')::INTEGER, 3),
          'original_price', COALESCE((metadata_obj->>'originalPrice')::DECIMAL, price_value),
          'discount', COALESCE((metadata_obj->>'discount')::INTEGER, 0)
        ),
        hotel_record.created_at,
        hotel_record.updated_at
      ) RETURNING id INTO new_enterprise_id;
      
      RAISE NOTICE '✅ Enterprise criado: % (ID: %)', hotel_record.title, new_enterprise_id;
      
      -- 2. Criar Property padrão
      INSERT INTO properties (
        enterprise_id,
        name,
        description,
        property_type,
        max_guests,
        base_price_per_night,
        currency,
        status,
        created_at,
        updated_at
      ) VALUES (
        new_enterprise_id,
        hotel_record.title || ' - Propriedade Principal',
        COALESCE(hotel_record.description, ''),
        'room',
        max_guests_value,
        price_value,
        'BRL',
        'active',
        hotel_record.created_at,
        hotel_record.updated_at
      ) RETURNING id INTO new_property_id;
      
      RAISE NOTICE '✅ Property criado: % (ID: %)', hotel_record.title, new_property_id;
      
      -- 3. Criar Accommodation padrão
      INSERT INTO accommodations (
        property_id,
        name,
        description,
        accommodation_type,
        max_guests,
        base_price_per_night,
        currency,
        status,
        created_at,
        updated_at
      ) VALUES (
        new_property_id,
        hotel_record.title || ' - Acomodação Principal',
        COALESCE(hotel_record.description, ''),
        'standard',
        max_guests_value,
        price_value,
        'BRL',
        'active',
        hotel_record.created_at,
        hotel_record.updated_at
      ) RETURNING id INTO new_accommodation_id;
      
      RAISE NOTICE '✅ Accommodation criado: % (ID: %)', hotel_record.title, new_accommodation_id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '❌ Erro ao migrar hotel % (ID: %): %', hotel_record.title, hotel_record.id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;
  
  RAISE NOTICE '🎉 Migração concluída!';
END $$;

-- ===================================================================
-- VERIFICAÇÃO
-- ===================================================================
DO $$
DECLARE
  total_old INTEGER;
  total_new INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_old FROM website_content WHERE page_type = 'hotels' AND status = 'active';
  SELECT COUNT(*) INTO total_new FROM enterprises WHERE enterprise_type = 'hotel' AND metadata->>'migrated_from' = 'website_content';
  
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '   Hotéis originais: %', total_old;
  RAISE NOTICE '   Hotéis migrados: %', total_new;
  
  IF total_new < total_old THEN
    RAISE WARNING '⚠️ Alguns hotéis não foram migrados!';
  END IF;
END $$;

-- ===================================================================
-- LIMPEZA: Remover função auxiliar (opcional)
-- ===================================================================
-- DROP FUNCTION IF EXISTS extract_city_state(TEXT);
