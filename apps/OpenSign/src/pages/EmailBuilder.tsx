import { CssBaseline, ThemeProvider } from "@mui/material";

import theme from "../components/emailbuilder/EmailBuildertheme";
import EmailBuilderApp from "../components/emailbuilder/App";

const EmailBuilder = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EmailBuilderApp />
    </ThemeProvider>
  );
};

export default EmailBuilder;
