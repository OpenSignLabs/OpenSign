import Loader from "../../primitives/Loader";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function VerifyEmail(props) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 1999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.3)"
      }}
    >
      <Paper
        className="hide-scrollbar"
        sx={{
          width: { xs: "80%", md: "40%" },
          maxHeight: "90%",
          overflowY: "auto",
          fontSize: "0.875rem"
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            pt: "15px",
            px: "20px",
            color: "text.primary"
          }}
        >
          {t("otp-verification")}
        </Typography>
        {props.isVerifyModal ? (
          <form
            onSubmit={(e) => {
              props.setIsVerifyModal(false);
              props.handleVerifyEmail(e);
            }}
          >
            <Box sx={{ px: 3, py: 1.5, color: "text.primary" }}>
              <Typography component="label" sx={{ mb: 1, display: "block" }}>
                {t("enter-otp")}
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                type="tel"
                placeholder={t("otp-placeholder")}
                value={props.otp}
                onChange={(e) => props.setOtp(e.target.value)}
                slotProps={{
                  htmlInput: {
                    pattern: "[0-9]{6}",
                    maxLength: 6,
                    inputMode: "numeric",
                    autoComplete: "one-time-code",
                    onInvalid: (e) =>
                      e.target.setCustomValidity(t("input-required")),
                    onInput: (e) => e.target.setCustomValidity("")
                  }
                }}
              />
            </Box>
            <Box sx={{ px: 3, my: 1.5 }}>
              <Button type="submit" variant="contained">
                {t("verify")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ ml: 1 }}
                onClick={(e) => props.handleResend(e)}
              >
                {t("resend")}
              </Button>
            </Box>
          </form>
        ) : props.otpLoader ? (
          <Box
            sx={{
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Loader />
          </Box>
        ) : (
          <Box sx={{ px: 3, py: 1.5, color: "text.primary" }}>
            <Typography sx={{ mb: 1, fontSize: "0.875rem" }}>
              {t("verify-email")}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                type="submit"
                onClick={() => props.handleVerifyBtn()}
              >
                {t("send-otp")}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default VerifyEmail;
