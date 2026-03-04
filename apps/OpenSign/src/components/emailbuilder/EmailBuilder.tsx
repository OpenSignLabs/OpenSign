import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import theme from "./EmailBuildertheme";

const EmailBuilder = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export default EmailBuilder;
