// Users page: BetterSign identities (VLAD -> account links). Admins link a
// VLAD to an account and turn it on; a VLAD that tried to sign in without a
// link shows up here unassigned and off. Server side:
// apps/OpenSignServer/cloud/parsefunction/bsIdentityAdmin.js.
import { useEffect, useState } from "react";
import Parse from "parse";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ModalUi from "../primitives/ModalUi";
import Tooltip from "../primitives/Tooltip";
import Loader from "../primitives/Loader";
import { copytoData } from "../constant/Utils";
import { withSessionValidation } from "../utils";

const cellSx = { fontSize: "12px" };
const inputSx = { "& .MuiInputBase-input": { fontSize: "0.75rem" } };
const shortVlad = (vlad) =>
  vlad.length > 24 ? `${vlad.slice(0, 12)}…${vlad.slice(-8)}` : vlad;
const accountName = (a) => (a.name ? `${a.email} (${a.name})` : a.email);

const BsIdentities = ({ showAlert }) => {
  const { t } = useTranslation();
  const [identities, setIdentities] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [labels, setLabels] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ vlad: "", userId: "", label: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      setIsLoading(true);
      const res = await Parse.Cloud.run("bsidentitylist");
      setIdentities(res.identities);
      setAccounts(res.accounts);
      setLabels(Object.fromEntries(res.identities.map((i) => [i.id, i.label])));
    } catch (err) {
      console.log("Err in bsidentitylist", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setIsLoading(false);
    }
  }

  const replace = (row) =>
    setIdentities((prev) => prev.map((i) => (i.id === row.id ? row : i)));

  const save = withSessionValidation(async (id, changes) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const row = await Parse.Cloud.run("bsidentitysave", { id, ...changes });
      replace(row);
      setLabels((l) => ({ ...l, [row.id]: row.label }));
      showAlert("success", t("bs-identities.saved"));
    } catch (err) {
      console.log("Err in bsidentitysave", err);
      showAlert("danger", err?.message || t("something-went-wrong-mssg"), 3000);
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  });

  const saveLabel = (row) => {
    const label = (labels[row.id] ?? "").trim();
    if (label !== row.label) save(row.id, { label });
  };

  const handleAdd = withSessionValidation(async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const row = await Parse.Cloud.run("bsidentitysave", {
        vlad: addForm.vlad.trim(),
        userId: addForm.userId || null,
        label: addForm.label,
        active: !!addForm.userId
      });
      setIdentities((prev) => [row, ...prev]);
      setLabels((l) => ({ ...l, [row.id]: row.label }));
      setAddForm({ vlad: "", userId: "", label: "" });
      setIsAddOpen(false);
      showAlert("success", t("bs-identities.saved"));
    } catch (err) {
      console.log("Err in bsidentitysave", err);
      showAlert("danger", err?.message || t("something-went-wrong-mssg"), 3000);
    } finally {
      setIsAdding(false);
    }
  });

  const handleDelete = withSessionValidation(async (row) => {
    setDeleting(null);
    setBusy((b) => ({ ...b, [row.id]: true }));
    try {
      await Parse.Cloud.run("bsidentitydelete", { id: row.id });
      setIdentities((prev) => prev.filter((i) => i.id !== row.id));
      showAlert("success", t("bs-identities.deleted"));
    } catch (err) {
      console.log("Err in bsidentitydelete", err);
      showAlert("danger", err?.message || t("something-went-wrong-mssg"), 3000);
      setBusy((b) => ({ ...b, [row.id]: false }));
    }
  });

  // An array, not a Fragment: MUI's Select reads its options from direct children.
  const accountOptions = [
    <MenuItem key="" value="" sx={{ fontSize: "0.75rem" }}>
      {t("bs-identities.unassigned")}
    </MenuItem>,
    ...accounts.map((a) => (
      <MenuItem key={a.userId} value={a.userId} sx={{ fontSize: "0.75rem" }}>
        {accountName(a)}
      </MenuItem>
    ))
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          my: 1,
          mx: 1.5,
          fontSize: { xs: "18px", md: "20px" }
        }}
      >
        <Box sx={{ fontWeight: 300 }}>
          {t("bs-identities.title")}{" "}
          <Box
            component="span"
            sx={{ fontSize: { xs: "0.75rem", md: "13px" }, fontWeight: 400 }}
          >
            <Tooltip message={t("bs-identities.help")} />
          </Box>
        </Box>
        <IconButton
          color="secondary"
          onClick={() => setIsAddOpen(true)}
          aria-label={t("bs-identities.add")}
          title={t("bs-identities.add")}
        >
          <i className="fa-light fa-square-plus"></i>
        </IconButton>
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Loader />
        </Box>
      ) : (
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                {["vlad", "account", "label", "last-attempt", "active"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{ fontSize: "14px", fontWeight: 600 }}
                    >
                      {t(`bs-identities.${h}`)}
                    </TableCell>
                  )
                )}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {identities.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{ ...cellSx, textAlign: "center" }}
                  >
                    {t("bs-identities.empty")}
                  </TableCell>
                </TableRow>
              )}
              {identities.map((row) => {
                const known =
                  !row.userId || accounts.some((a) => a.userId === row.userId);
                return (
                  <TableRow
                    key={row.id}
                    sx={{ opacity: busy[row.id] ? 0.5 : 1 }}
                  >
                    <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                      <Box
                        component="span"
                        title={row.vlad}
                        sx={{ fontFamily: "monospace" }}
                      >
                        {shortVlad(row.vlad)}
                      </Box>
                      <IconButton
                        size="small"
                        title={t("copy")}
                        aria-label={t("copy")}
                        onClick={() => {
                          copytoData(row.vlad);
                          showAlert("success", t("copied"));
                        }}
                      >
                        <i
                          className="fa-light fa-copy"
                          style={{ fontSize: 12 }}
                        ></i>
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, minWidth: 200 }}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={known ? row.userId || "" : row.userId}
                        disabled={!!busy[row.id]}
                        onChange={(e) =>
                          save(row.id, { userId: e.target.value || null })
                        }
                        slotProps={{ select: { displayEmpty: true } }}
                        sx={inputSx}
                      >
                        {accountOptions}
                        {!known && (
                          <MenuItem
                            value={row.userId}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {row.userId}
                          </MenuItem>
                        )}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, minWidth: 160 }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={labels[row.id] ?? ""}
                        disabled={!!busy[row.id]}
                        onChange={(e) =>
                          setLabels((l) => ({ ...l, [row.id]: e.target.value }))
                        }
                        onBlur={() => saveLabel(row)}
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                        sx={inputSx}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                      {row.lastSeenAt
                        ? new Date(row.lastSeenAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Switch
                        size="small"
                        checked={row.active}
                        disabled={
                          !!busy[row.id] || (!row.userId && !row.active)
                        }
                        title={
                          !row.userId ? t("bs-identities.choose-account") : ""
                        }
                        onChange={() => save(row.id, { active: !row.active })}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={!!busy[row.id]}
                        title={t("delete")}
                        aria-label={t("delete")}
                        onClick={() => setDeleting(row)}
                      >
                        <i className="fa-light fa-trash"></i>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ModalUi
        isOpen={!!deleting}
        title={t("bs-identities.delete-title")}
        handleClose={() => setDeleting(null)}
      >
        <Box sx={{ m: 2.5 }}>
          <Typography sx={{ fontSize: "1rem", color: "text.primary" }}>
            {t("bs-identities.delete-confirm")}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem", fontFamily: "monospace", mt: 1 }}
          >
            {deleting && shortVlad(deleting.vlad)}
          </Typography>
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(deleting)}
            >
              {t("yes")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setDeleting(null)}
            >
              {t("no")}
            </Button>
          </Box>
        </Box>
      </ModalUi>

      <ModalUi
        isOpen={isAddOpen}
        title={t("bs-identities.add")}
        handleClose={() => setIsAddOpen(false)}
      >
        <Box component="form" onSubmit={handleAdd} sx={{ m: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label={t("bs-identities.vlad")}
              value={addForm.vlad}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, vlad: e.target.value }))
              }
              required
              multiline
              minRows={2}
              size="small"
              helperText={t("bs-identities.vlad-help")}
              sx={{ ...inputSx, "& textarea": { fontFamily: "monospace" } }}
            />
            <TextField
              select
              label={t("bs-identities.account")}
              value={addForm.userId}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, userId: e.target.value }))
              }
              size="small"
              helperText={t("bs-identities.account-help")}
              // Show "Unassigned" rather than an empty box.
              slotProps={{
                select: { displayEmpty: true },
                inputLabel: { shrink: true }
              }}
              sx={inputSx}
            >
              {accountOptions}
            </TextField>
            <TextField
              label={t("bs-identities.label")}
              value={addForm.label}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, label: e.target.value }))
              }
              size="small"
              slotProps={{ htmlInput: { maxLength: 100 } }}
              sx={inputSx}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
            <Button type="submit" variant="contained" disabled={isAdding}>
              {t("submit")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setIsAddOpen(false)}
            >
              {t("cancel")}
            </Button>
          </Box>
        </Box>
      </ModalUi>
    </Box>
  );
};

export default BsIdentities;
