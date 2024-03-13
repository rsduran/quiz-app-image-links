// theme.js or theme.ts

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: "'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif",
    body: "'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif",
  },
});

export default theme;