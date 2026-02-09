-- Migration: Add "standalone" curriculum for standalone quests
-- This allows quests generated without a curriculum to still track progress

INSERT INTO curricula (
    id,
    title,
    description,
    subject,
    grade_level,
    teacher_id,
    teacher_name,
    total_quests,
    estimated_hours,
    status,
    published,
    created_at,
    updated_at
) VALUES (
    'standalone',
    'Standalone Quests',
    'Collection of standalone quests not part of a formal curriculum',
    'Mixed',
    '1-12',
    'system',
    'System',
    999,  -- High number to allow many standalone quests
    0,
    'published',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
