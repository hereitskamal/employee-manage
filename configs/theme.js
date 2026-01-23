'use client';

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb", // Tailwind blue-600
      light: "#60a5fa", // Tailwind blue-400
      dark: "#1d4ed8", // Tailwind blue-700
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#93c5fd", // Tailwind blue-300
      light: "#bfdbfe", // Tailwind blue-200
      dark: "#60a5fa", // Tailwind blue-400
      contrastText: "#1e3a8a", // Tailwind blue-900
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
  },
});

export default theme;
