import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/dateHelpers';

interface LocalizedDateProps {
  date: string | number | Date | null | undefined;
  format?: string;
  className?: string;
}

/**
 * A wrapper component that securely re-renders a date string 
 * using date-fns adhering to the current active i18next language.
 */
export const LocalizedDate: React.FC<LocalizedDateProps> = ({ 
  date, 
  format = 'dd/MM/yyyy', 
  className 
}) => {
  const { i18n } = useTranslation();
  // We use this state simply to force a re-render when the language changes
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChanged = (newLang: string) => {
      setLang(newLang);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  if (!date) return <span className={className}>-</span>;

  // Utilize the date-fns utility which extracts from i18n
  const formattedString = formatDate(date, format);

  return (
    <span className={className} data-lang={lang}>
      {formattedString}
    </span>
  );
};
