import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';

const variants = {
  logo: 'logo',
  page: 'pageTitle',
  section: 'sectionTitle',
  hero: 'heroTitle',
  card: 'cardTitle',
  body: 'body',
  bodyBold: 'bodyBold',
  caption: 'caption',
  micro: 'micro'
};

const AppText = ({
  variant = 'body',
  style,
  color,
  numberOfLines,
  children
}) => {
  const theme = useTheme();
  const token = theme.typography[variants[variant] || 'body'];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        token,
        {
          color: color || theme.colors.textPrimary
        },
        style
      ]}
    >
      {children}
    </Text>
  );
};

export default AppText;
