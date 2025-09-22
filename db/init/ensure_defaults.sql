USE laf_portal;

DELIMITER $$

DROP PROCEDURE IF EXISTS ensure_default_seed $$
CREATE PROCEDURE ensure_default_seed()
BEGIN
    DECLARE users_table_exists BOOLEAN DEFAULT FALSE;
    DECLARE categories_table_exists BOOLEAN DEFAULT FALSE;
    DECLARE users_count INT DEFAULT 0;
    DECLARE categories_count INT DEFAULT 0;

    SELECT COUNT(*) > 0 INTO users_table_exists
      FROM information_schema.tables
     WHERE table_schema = 'laf_portal'
       AND table_name = 'users';

    SELECT COUNT(*) > 0 INTO categories_table_exists
      FROM information_schema.tables
     WHERE table_schema = 'laf_portal'
       AND table_name = 'categories';

    IF categories_table_exists THEN
        INSERT INTO categories (id, name, slug, description, is_active, allowed_roles, created_at, updated_at)
        SELECT UUID(), 'Edital', 'edital', NULL, TRUE, NULL, NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'edital');

        INSERT INTO categories (id, name, slug, description, is_active, allowed_roles, created_at, updated_at)
        SELECT UUID(), 'Prestação de Contas', 'prestacao-de-contas', NULL, TRUE, NULL, NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'prestacao-de-contas');

        INSERT INTO categories (id, name, slug, description, is_active, allowed_roles, created_at, updated_at)
        SELECT UUID(), 'Comunicados', 'comunicados', NULL, TRUE, NULL, NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'comunicados');

        INSERT INTO categories (id, name, slug, description, is_active, allowed_roles, created_at, updated_at)
        SELECT UUID(), 'TJD', 'tjd', NULL, TRUE, JSON_ARRAY('tjd'), NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tjd');
    END IF;

    IF users_table_exists THEN
        INSERT INTO users (id, name, email, password_hash, role, is_active, allowed_category_slugs, created_at, updated_at)
        SELECT UUID(), 'Administrador', 'admin@organizacao.local', 'pbkdf2:sha256:1000000$Rhk3tsqQXlBsKGTh$3756dcfa1e30128e8b26944ea420323ce1e38ee6111a4e822ca544625c301058', 'admin', TRUE, NULL, NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@organizacao.local');

        INSERT INTO users (id, name, email, password_hash, role, is_active, allowed_category_slugs, created_at, updated_at)
        SELECT UUID(), 'Secretaria', 'secretaria@organizacao.local', 'pbkdf2:sha256:1000000$Rhk3tsqQXlBsKGTh$3756dcfa1e30128e8b26944ea420323ce1e38ee6111a4e822ca544625c301058', 'secretaria', TRUE, NULL, NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'secretaria@organizacao.local');

        INSERT INTO users (id, name, email, password_hash, role, is_active, allowed_category_slugs, created_at, updated_at)
        SELECT UUID(), 'Tribunal de Justiça Desportiva', 'tjd@organizacao.local', 'pbkdf2:sha256:1000000$Rhk3tsqQXlBsKGTh$3756dcfa1e30128e8b26944ea420323ce1e38ee6111a4e822ca544625c301058', 'tjd', TRUE, JSON_ARRAY('tjd'), NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tjd@organizacao.local');

        INSERT INTO users (id, name, email, password_hash, role, is_active, allowed_category_slugs, created_at, updated_at)
        SELECT UUID(), 'Editor', 'editor@organizacao.local', 'pbkdf2:sha256:1000000$Rhk3tsqQXlBsKGTh$3756dcfa1e30128e8b26944ea420323ce1e38ee6111a4e822ca544625c301058', 'editor', TRUE, JSON_ARRAY('edital', 'prestacao-de-contas', 'comunicados'), NOW(6), NOW(6)
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'editor@organizacao.local');
    END IF;

    IF users_table_exists THEN
        SELECT COUNT(*) INTO users_count
          FROM users
         WHERE email IN (
            'admin@organizacao.local',
            'secretaria@organizacao.local',
            'tjd@organizacao.local',
            'editor@organizacao.local'
        );
    END IF;

    IF categories_table_exists THEN
        SELECT COUNT(*) INTO categories_count
          FROM categories
         WHERE slug IN ('edital', 'prestacao-de-contas', 'comunicados', 'tjd');
    END IF;

    IF users_count = 4 AND categories_count = 4 THEN
        DROP EVENT IF EXISTS ensure_default_seed_event;
    END IF;
END $$

DROP EVENT IF EXISTS ensure_default_seed_event $$

CREATE EVENT ensure_default_seed_event
    ON SCHEDULE EVERY 5 SECOND
    STARTS CURRENT_TIMESTAMP
    DO
BEGIN
    CALL ensure_default_seed();
END $$

CALL ensure_default_seed() $$

DELIMITER ;
