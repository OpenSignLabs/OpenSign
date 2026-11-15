import React, { useEffect, useState } from "react";
import Parse from "parse";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useLocation } from "react-router";
import ModalUi from "../primitives/ModalUi";
import pad from "../assets/images/pad.svg";
import Tooltip from "../primitives/Tooltip";
import AddUser from "../components/AddUser";
import BsIdentities from "../components/BsIdentities";
import EditUser from "../components/EditUser";
import {
  useTranslation
} from "react-i18next";
import DeleteUserModal from "../primitives/DeleteUserModal";
import axios from "axios";
import { usersActions } from "../json/ReportJson";
import { withSessionValidation } from "../utils";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const heading = ["Sr.No", "Name", "Email", "Phone", "Role", "Team", "Active"];
const UserList = () => {
  const { t } = useTranslation();
  const [userList, setUserList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isModal, setIsModal] = useState({
    form: false,
    addseats: false,
    options: false
  });
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isActiveModal, setIsActiveModal] = useState({});
  const [isActLoader, setIsActLoader] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [formHeader, setFormHeader] = useState(t("add-user"));
  const [deleteUserRes, setDeleteUserRes] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isActModal, setIsActModal] = useState({});
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const recordperPage = 10;
  const startIndex = (currentPage - 1) * recordperPage; // user per page

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(userList.length / recordperPage);
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }
    return pages;
  };
  const pageNumbers = getPaginationRange();
  // to slice out 10 objects from array for current page
  const indexOfLastDoc = currentPage * recordperPage;
  const indexOfFirstDoc = indexOfLastDoc - recordperPage;
  const currentList = userList?.slice(indexOfFirstDoc, indexOfLastDoc);
  useEffect(() => {
    fetchUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function fetchUserList() {
    try {
      setIsLoader(true);
      const extUser =
        localStorage.getItem("Extand_Class") &&
        JSON.parse(localStorage.getItem("Extand_Class"))?.[0];

      if (extUser) {
        const admin =
          extUser?.UserRole &&
          (extUser?.UserRole === "contracts_Admin" ||
            extUser?.UserRole === "contracts_OrgAdmin")
            ? true
            : false;
        setIsAdmin(admin);
      }
      const res = await Parse.Cloud.run("getuserlistbyorg", {
        organizationId: extUser.OrganizationId.objectId
      });
      const _userRes = JSON.parse(JSON.stringify(res));
      setUserList(_userRes);
    } catch (err) {
      console.log("Err in fetch userlist", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setIsLoader(false);
    }
  }
  const handleModal = (modalName) => {
    setIsModal((obj) => ({ ...obj, [modalName]: !obj[modalName] }));
  };

  // Change page
  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleUserData = (userData) => {
    if (userData) {
      setUserList((prev) => [userData, ...prev]);
    }
  };
  // `formatRow` is used to show data in poper manner like
  // if data is of array type then it will join array items with ","
  // if data is of object type then it Name values will be show in row
  // if no data available it will show hyphen "-"
  const formatRow = (row) => {
    if (Array.isArray(row)) {
      let updateArr = row.map((x) => x.Name);
      return updateArr.join(", ");
    } else if (typeof row === "object" && row !== null) {
      return row?.Name || "-";
    } else {
      return "-";
    }
  };
  const handleClose = () => setIsActiveModal({});

  const handleToggleSubmit = withSessionValidation(async (user) => {
    const index = userList.findIndex((obj) => obj.objectId === user.objectId);
    if (index !== -1) {
      setIsActiveModal({});
      setIsActLoader({ [user.objectId]: true });
      const newArray = [...userList];
      const IsDisabled = newArray[index]?.IsDisabled;
      newArray[index] = { ...newArray[index], IsDisabled: !IsDisabled };
      setUserList(newArray);
      try {
        const extUser = new Parse.Object("contracts_Users");
        extUser.id = user.objectId;
        extUser.set("IsDisabled", !IsDisabled);
        await extUser.save();
        showAlert(
          !IsDisabled === true ? "danger" : "success",
          !IsDisabled === true ? t("user-deactivated") : t("user-activated")
        );
      } catch (err) {
        showAlert("danger", t("something-went-wrong-mssg"));
        console.log("err in disable team", err);
      } finally {
        setIsActLoader({});
      }
    }
  });
  const handleToggleBtn = (user) => {
    setIsActiveModal({ [user.objectId]: true });
  };

  // `showAlert` handle show/hide alert
  const showAlert = (type, msg, timer = 1500) => {
    setIsAlert({ type, msg });
    setTimeout(() => setIsAlert({ type: "success", msg: "" }), timer);
  };

  const handleDeleteAccount = withSessionValidation(async (item) => {
    setDeleting(true);
    if (item?.UserId?.objectId) {
      const url = localStorage.getItem("baseUrl")?.replace(/\/app\/?$/, "/");
      const deleteUrl = `${url}deleteuser/${item.UserId.objectId}`;
      try {
        await axios.post(deleteUrl, null, {
          headers: { sessiontoken: localStorage.getItem("accesstoken") }
        });
        setUserList((prev) =>
          prev.filter((user) => user.objectId !== item.objectId)
        );
        showAlert("success", t("user-deleted-successfully"));
      } catch (err) {
        const message = err?.response?.data?.message || err?.message;
        setDeleteUserRes(message);
        showAlert("danger", message);
        console.log("Err in deleteuser acc", err);
      } finally {
        setDeleting(false);
      }
    } else {
      showAlert("danger", t("something-went-wrong-mssg"));
      setDeleteUserRes(t("something-went-wrong-mssg"));
      setDeleting(false);
    }
  });
  const handleCloseModal = () => {
    setIsActModal({});
    setDeleteUserRes("");
    setDeleting(false);
  };

  const handleActionBtn = withSessionValidation(async (act, item) => {
      setIsActModal({ [`${act.action}_${item.objectId}`]: true });
  });
  const handleBtnVisibility = (act, item) => {
    if (act.action === "edit") {
      // An OrgAdmin can't edit the tenant Admin (updateuserbyadmin refuses).
      return (
        extClass?.[0]?.UserRole === "contracts_Admin" ||
        item?.UserRole !== "contracts_Admin"
      );
    }
    if (act.restrictAdmin) {
      if (item?.UserRole === "contracts_Admin") {
        return false;
      } else {
        return item?.objectId !== extClass?.[0]?.objectId;
      }
    } else if (
      act.restrictBtn === true &&
      item?.objectId === extClass?.[0]?.objectId
    ) {
      return true;
    } else {
      return true;
    }
  };
  const handleUserEdited = (updated) => {
    setUserList((prev) =>
      prev.map((x) =>
        x.objectId === updated.objectId ? { ...x, ...updated } : x
      )
    );
    // Editing yourself: keep the cached profile in step.
    if (updated.objectId === extClass?.[0]?.objectId) {
      localStorage.setItem(
        "Extand_Class",
        JSON.stringify([{ ...extClass[0], ...updated }])
      );
    }
  };
  const handleActiveToggleVisibility = (item) => {
    if (item?.UserRole === "contracts_Admin") {
      return false;
    } else {
      return item?.objectId !== extClass?.[0]?.objectId;
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {isLoader && (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: { xs: 300, md: 400 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
            borderRadius: 4
          }}
        >
          <Loader />
        </Box>
      )}
      {Object.keys(isActLoader)?.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            zIndex: 30,
            borderRadius: 4
          }}
        >
          <Loader />
        </Box>
      )}

      {
          !isLoader && (
            <>
              {isAdmin ? (
                <Paper
                  elevation={3}
                  sx={{
                    p: 1,
                    width: "100%",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    borderRadius: 4
                  }}
                >
                  {isAlert.msg && (
                    <Alert type={isAlert.type}>{isAlert.msg}</Alert>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      my: 1,
                      mx: 1.5,
                      fontSize: { xs: "20px", md: "23px" }
                    }}
                  >
                    <Box sx={{ fontWeight: 300 }}>
                      {t("report-name.Users")}{" "}
                      <Box
                        component="span"
                        sx={{ fontSize: { xs: "0.75rem", md: "13px" }, fontWeight: 400 }}
                      >
                        <Tooltip message={t("users-from-teams")} />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                        alignItems: "center"
                      }}
                    >
                      <IconButton
                        color="secondary"
                        onClick={() => handleModal("form")}
                        aria-label={t("add-user")}
                      >
                        <i className="fa-light fa-square-plus"></i>
                      </IconButton>
                    </Box>
                  </Box>
                  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                    <Table sx={{ mb: "50px" }}>
                      <TableHead>
                        <TableRow>
                          {heading?.map((item, index) => (
                            <TableCell key={index} sx={{ fontSize: "14px", fontWeight: 600 }}>
                              {t(`report-heading.${item}`)}
                            </TableCell>
                          ))}
                          {usersActions?.length > 0 && (
                            <TableCell
                              sx={{ color: "transparent", pointerEvents: "none" }}
                            >
                              {t("action")}
                            </TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      {userList?.length > 0 && (
                        <TableBody>
                          {currentList.map((item, index) => (
                            <TableRow key={index}>
                              {heading.includes("Sr.No") && (
                                <TableCell
                                  component="th"
                                  scope="row"
                                  sx={{ fontSize: "12px" }}
                                >
                                  {startIndex + index + 1}
                                </TableCell>
                              )}
                              <TableCell sx={{ fontSize: "12px", fontWeight: 600 }}>
                                {item?.Name}{" "}
                              </TableCell>
                              <TableCell sx={{ fontSize: "12px" }}>
                                {item?.Email || "-"}
                              </TableCell>
                              <TableCell sx={{ fontSize: "12px" }}>
                                {item?.Phone || "-"}
                              </TableCell>
                              <TableCell sx={{ fontSize: "12px" }}>
                                {item?.UserRole?.split("_").pop() || "-"}
                              </TableCell>
                              <TableCell sx={{ fontSize: "12px" }}>
                                {formatRow(item.TeamIds)}
                              </TableCell>
                              {handleActiveToggleVisibility(item) ? (
                                <TableCell sx={{ fontSize: "12px", fontWeight: 600 }}>
                                  <Switch
                                    id={`isdisabled-${item.objectId}`}
                                    size="small"
                                    checked={item?.IsDisabled !== true}
                                    onChange={() => handleToggleBtn(item)}
                                  />
                                  {isActiveModal[item.objectId] && (
                                    <ModalUi
                                      isOpen
                                      title={t("user-status")}
                                      handleClose={handleClose}
                                    >
                                      <Box sx={{ m: 2.5 }}>
                                        <Typography
                                          sx={{
                                            fontSize: "1.125rem",
                                            fontWeight: 400,
                                            color: "text.primary"
                                          }}
                                        >
                                          {t("are-you-sure")}{" "}
                                          {item?.IsDisabled
                                            ? t("activate")
                                            : t("deactivate")}{" "}
                                          {t("this-user")}?
                                        </Typography>
                                        <Divider sx={{ mt: 2 }} />
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mt: 1.5,
                                            gap: 1
                                          }}
                                        >
                                          <Button
                                            variant="contained"
                                            onClick={() =>
                                              handleToggleSubmit(item)
                                            }
                                          >
                                            {t("yes")}
                                          </Button>
                                          <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleClose}
                                          >
                                            {t("no")}
                                          </Button>
                                        </Box>
                                      </Box>
                                    </ModalUi>
                                  )}
                                </TableCell>
                              ) : (
                                <TableCell sx={{ fontSize: "12px", fontWeight: 600 }} />
                              )}

                              {isAdmin && (
                                <TableCell sx={{ fontSize: "12px" }}>
                                  <Box
                                    sx={{
                                      color: "text.primary",
                                      minWidth: "max-content",
                                      display: "flex",
                                      flexDirection: "row",
                                      columnGap: 1,
                                      rowGap: 0.5,
                                      justifyContent: "flex-start",
                                      alignItems: "center"
                                    }}
                                  >
                                    {usersActions?.length > 0 &&
                                      usersActions?.map((act, index) => (
                                        <React.Fragment key={index}>
                                          {handleBtnVisibility(act, item) &&
                                            (act.action !== "option" ? (
                                              <IconButton
                                                size="small"
                                                data-tut={act?.selector}
                                                onClick={() =>
                                                  handleActionBtn(act, item)
                                                }
                                                title={t(
                                                  `btnLabel.${act.hoverLabel}`
                                                )}
                                                color={
                                                  act?.btnColor?.includes(
                                                    "secondary"
                                                  )
                                                    ? "secondary"
                                                    : act?.btnColor?.includes(
                                                          "error"
                                                        ) ||
                                                        act?.btnColor?.includes(
                                                          "danger"
                                                        )
                                                      ? "error"
                                                      : act?.btnColor?.includes(
                                                            "primary"
                                                          )
                                                        ? "primary"
                                                        : "default"
                                                }
                                              >
                                                <i className={act.btnIcon}></i>
                                                {act.btnLabel && (
                                                  <Box
                                                    component="span"
                                                    sx={{
                                                      textTransform: "uppercase",
                                                      fontWeight: 500,
                                                      ml: 0.5,
                                                      fontSize: "0.875rem"
                                                    }}
                                                  >
                                                    {t(
                                                      `btnLabel.${act.btnLabel}`
                                                    )}
                                                  </Box>
                                                )}
                                              </IconButton>
                                            ) : (
                                              <Box
                                                role="button"
                                                data-tut={act?.selector}
                                                onClick={() =>
                                                  handleActionBtn(act, item)
                                                }
                                                title={t(
                                                  `btnLabel.${act.hoverLabel}`
                                                )}
                                                sx={{
                                                  color: "text.primary",
                                                  fontSize: "1.125rem",
                                                  mr: 1,
                                                  position: "relative",
                                                  cursor: "pointer"
                                                }}
                                              >
                                                <i className={act.btnIcon}></i>
                                              </Box>
                                            ))}
                                        </React.Fragment>
                                      ))}
                                  </Box>
                                </TableCell>
                              )}
                              {isActModal["edit_" + item.objectId] && (
                                <ModalUi
                                  isOpen
                                  title={t("edit-user")}
                                  handleClose={handleCloseModal}
                                >
                                  <EditUser
                                    user={item}
                                    isSelf={
                                      item.objectId === extClass?.[0]?.objectId
                                    }
                                    showAlert={showAlert}
                                    onSaved={handleUserEdited}
                                    onClose={handleCloseModal}
                                  />
                                </ModalUi>
                              )}
                              <DeleteUserModal
                                title={t("delete-account")}
                                deleting={deleting}
                                userEmail={item?.Email}
                                isOpen={isActModal["delete_" + item.objectId]}
                                onConfirm={() => handleDeleteAccount(item)}
                                deleteRes={deleteUserRes}
                                handleClose={handleCloseModal}
                              />
                            </TableRow>
                          ))}
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.5,
                        p: 1
                      }}
                    >
                      {userList.length > recordperPage && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => paginateBack()}
                        >
                          {t("prev")}
                        </Button>
                      )}
                      {pageNumbers.map((x, i) => (
                        <Button
                          key={i}
                          size="small"
                          variant={x === currentPage ? "contained" : "outlined"}
                          onClick={() => setCurrentPage(x)}
                          disabled={x === "..."}
                        >
                          {x}
                        </Button>
                      ))}
                      {userList.length > recordperPage && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => paginateFront()}
                        >
                          {t("next")}
                        </Button>
                      )}
                    </Box>
                  </Box>
                  {userList?.length <= 0 && (
                    <Box
                      sx={{
                        height: isDashboard ? 317 : undefined,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        bgcolor: "background.paper",
                        color: "text.primary",
                        borderRadius: 3,
                        py: 2
                      }}
                    >
                      <Box sx={{ width: 60, height: 60, overflow: "hidden" }}>
                        <img
                          className="w-full h-full object-contain"
                          src={pad}
                          alt="img"
                        />
                      </Box>
                      <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {t("no-data-available")}
                      </Box>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <BsIdentities showAlert={showAlert} />
                  <ModalUi
                    isOpen={isModal.form}
                    title={formHeader}
                    handleClose={() => handleModal("form")}
                  >
                    <AddUser
                      showAlert={showAlert}
                      handleUserData={handleUserData}
                      closePopup={() => handleModal("form")}
                      setFormHeader={setFormHeader}
                    />
                  </ModalUi>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    width: "100%",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    borderRadius: 4
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "60px", lg: "120px" },
                        fontWeight: 600
                      }}
                    >
                      404
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "30px", lg: "50px" } }}>
                      {t("page-not-found")}
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )
      }
    </Box>
  );
};

export default UserList;
