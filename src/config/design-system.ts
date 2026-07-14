export const designSystem = {
  colors: {
    // Brand Colors (Stitch Approved)
    agPurple: "#723f8c",
    lavenderBlush: "#F7EAF9",
    charcoalNavy: "#23213A",
    pearlWhite: "#FFFFFF",

    // Background & Surfaces
    background: "#FFFFFF", // pearl-white
    onBackground: "#23213A", // charcoal-navy
    surface: "#FFFFFF",
    surfaceVariant: "#e9e0e7",
    surfaceDim: "#e0d7df",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#fbf1f8",
    surfaceContainer: "#f5ebf3",
    surfaceContainerHigh: "#efe5ed",
    surfaceContainerHighest: "#e9e0e7",
    onSurface: "#1e1a1f",
    onSurfaceVariant: "#4d444f",

    // Semantic
    primary: "#592773",
    onPrimary: "#ffffff",
    primaryContainer: "#723f8c",
    onPrimaryContainer: "#eab8ff",
    
    // Outlines
    outline: "#7e7480",
    outlineVariant: "#cfc3d0",
  },
  typography: {
    fontFamily: {
      headline: "Playfair Display, serif",
      body: "Hanken Grotesk, sans-serif",
    },
    // Adding some base semantic sizes matching Stitch
    display: {
      lg: { fontSize: "64px", lineHeight: "72px", letterSpacing: "-0.02em" },
    },
    headline: {
      lg: { fontSize: "48px", lineHeight: "56px" },
      lgMobile: { fontSize: "32px", lineHeight: "40px" },
      md: { fontSize: "32px", lineHeight: "40px" },
      sm: { fontSize: "24px", lineHeight: "32px" },
    },
    body: {
      lg: { fontSize: "18px", lineHeight: "28px" },
      md: { fontSize: "16px", lineHeight: "24px" },
    },
    label: {
      md: { fontSize: "14px", lineHeight: "20px", letterSpacing: "0.05em", textTransform: "uppercase" },
      sm: { fontSize: "12px", lineHeight: "16px", letterSpacing: "0.02em", textTransform: "uppercase" },
    }
  },
  radius: {
    sm: "0.125rem", // 2px
    DEFAULT: "0.125rem", // 2px
    md: "0.25rem", // 4px
    lg: "0.25rem", // 4px
    xl: "0.5rem", // 8px
    full: "0.75rem", // 12px
  },
  spacing: {
    unit: "8px",
    marginDesktop: "80px",
    sectionVPadding: "120px",
    sectionVPaddingMobile: "64px",
    gutter: "24px",
    marginMobile: "20px",
  },
  shadows: {
    // Editorial shadow from Stitch
    editorial: "0px 4px 20px rgba(35, 33, 58, 0.05)",
  },
};
