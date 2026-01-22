-- Remove emojis from platform_docs content for a cleaner, professional look
UPDATE public.platform_docs
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(
                    REGEXP_REPLACE(
                      REGEXP_REPLACE(
                        REGEXP_REPLACE(
                          REGEXP_REPLACE(
                            REGEXP_REPLACE(
                              REGEXP_REPLACE(
                                REGEXP_REPLACE(
                                  REGEXP_REPLACE(
                                    REGEXP_REPLACE(
                                      content,
                                      '✅\s*', '- ', 'g'
                                    ),
                                    '❌\s*', 'Avoid: ', 'g'
                                  ),
                                  '🔑\s*', '', 'g'
                                ),
                                '📊\s*', '', 'g'
                              ),
                              '🚀\s*', '', 'g'
                            ),
                            '💡\s*', '', 'g'
                          ),
                          '⚠️\s*', '', 'g'
                        ),
                        '🔒\s*', '', 'g'
                      ),
                      '📝\s*', '', 'g'
                    ),
                    '🎯\s*', '', 'g'
                  ),
                  '📧\s*', '', 'g'
                ),
                '💰\s*', '', 'g'
              ),
              '🌐\s*', '', 'g'
            ),
            '⚡\s*', '', 'g'
          ),
          '🔧\s*', '', 'g'
        ),
        '📦\s*', '', 'g'
      ),
      '🔄\s*', '', 'g'
    ),
    '✨\s*', '', 'g'
  ),
  '🛠️\s*', '', 'g'
)
WHERE content IS NOT NULL;

-- Also update title to remove any emojis
UPDATE public.platform_docs
SET title = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          title,
          '✅\s*', '', 'g'
        ),
        '❌\s*', '', 'g'
      ),
      '🔑\s*', '', 'g'
    ),
    '📊\s*', '', 'g'
  ),
  '🚀\s*', '', 'g'
);