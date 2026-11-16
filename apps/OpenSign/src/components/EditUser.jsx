// Users page: an admin edits a user's name, phone, role and teams. Email is
// shown but can't be changed (it's also the username). Server side:
// apps/OpenSignServer/cloud/parsefunction/updateUserByAdmin.js.
import { useEffect, useState } from "react";
import Parse from "parse";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Loader from "../primitives/Loader";
import { withSessionValidation } from "../utils";

const ROLES = ["OrgAdmin", "Editor", "User"];
const labelSx = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  mb: 0.5
};
const inputSx = { "& .MuiInputBase-input": { fontSize: "0.75rem" } };

const EditUser = ({ user, isSelf, showAlert, onSaved, onClose }) => {
  const { t } = useTranslation();
  const role = user?.UserRole?.replace("contracts_", "") || "";
  const roleLocked = role === "Admin" || isSelf;
  const [form, setForm] = useState({
    name: user?.Name || "",
    phone: user?.Phone || "",
    role,
    teams: (user?.TeamIds || []).map((x) => x.objectId)
  });
  const [teamList, setTeamList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await Parse.Cloud.run("getteams", { active: true });
        setTeamList(JSON.parse(JSON.stringify(res)));
      } catch (err) {
        console.log("Err in getteams", err);
      }
    })();
  }, []);

  // Teams the user is in but that aren't in the active list (inactive ones)
  // stay selectable so saving doesn't silently drop them.
  const teams = [
    ...teamList,
    ...(user?.TeamIds || []).filter(
      (x) => !teamList.some((team) => team.objectId === x.objectId)
    )
  ];

  const handleSubmit = withSessionValidation(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const params = {
        extUserId: user.objectId,
        name: form.name,
        phone: form.phone,
        teams: form.teams
      };
      if (!roleLocked) params.role = form.role;
      const res = await Parse.Cloud.run("updateuserbyadmin", params);
      onSaved(JSON.parse(JSON.stringify(res)));
      showAlert("success", t("user-updated"));
      onClose();
    } catch (err) {
      console.log("Err in updateuserbyadmin", err);
      showAlert("danger", err?.message || t("something-went-wrong-mssg"), 3000);
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <Paper
      elevation={2}
      sx={{ borderRadius: 3, my: "1px", p: 1.5, position: "relative" }}
    >
      {isSaving && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            zIndex: 50
          }}
        >
          <Loader />
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 1.5 }}>
          <Box component="label" sx={labelSx}>
            {t("email")}
          </Box>
          <TextField
            value={user?.Email || ""}
            fullWidth
            size="small"
            disabled
            helperText={t("email-not-editable")}
            sx={inputSx}
          />
        </Box>
        <Box sx={{ mb: 1.5 }}>
          <Box component="label" htmlFor="edit-name" sx={labelSx}>
            {t("name")}
          </Box>
          <TextField
            id="edit-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            fullWidth
            size="small"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            sx={inputSx}
          />
        </Box>
        <Box sx={{ mb: 1.5 }}>
          <Box component="label" htmlFor="edit-phone" sx={labelSx}>
            {t("phone")}
          </Box>
          <TextField
            id="edit-phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder={t("phone-optional")}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { maxLength: 30 } }}
            sx={inputSx}
          />
        </Box>
        <Box sx={{ mb: 1.5 }}>
          <Box component="label" htmlFor="edit-role" sx={labelSx}>
            {t("Role")}
          </Box>
          <TextField
            id="edit-role"
            select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            disabled={roleLocked}
            fullWidth
            size="small"
            sx={inputSx}
          >
            {(roleLocked ? [role] : ROLES).map((x) => (
              <MenuItem key={x} value={x} sx={{ fontSize: "0.75rem" }}>
                {x}
              </MenuItem>
            ))}
          </TextField>
          {roleLocked && (
            <Typography
              sx={{ fontSize: "12px", ml: 1, color: "text.secondary" }}
            >
              {role === "Admin" ? t("admin-role-locked") : t("own-role-locked")}
            </Typography>
          )}
        </Box>
        <Box sx={{ mb: 1.5 }}>
          <Box component="label" htmlFor="edit-teams" sx={labelSx}>
            {t("report-heading.Team")}
          </Box>
          <TextField
            id="edit-teams"
            select
            value={form.teams}
            onChange={(e) => setForm((f) => ({ ...f, teams: e.target.value }))}
            required
            fullWidth
            size="small"
            slotProps={{
              select: {
                multiple: true,
                renderValue: (ids) =>
                  ids
                    .map(
                      (id) => teams.find((x) => x.objectId === id)?.Name || id
                    )
                    .join(", ")
              }
            }}
            sx={inputSx}
          >
            {teams.map((x) => (
              <MenuItem
                key={x.objectId}
                value={x.objectId}
                sx={{ fontSize: "0.75rem" }}
              >
                {x.Name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || form.teams.length === 0}
          >
            {t("save")}
          </Button>
          <Button
            type="button"
            variant="contained"
            color="secondary"
            onClick={onClose}
          >
            {t("cancel")}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default EditUser;
