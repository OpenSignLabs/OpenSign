import React, { useState, useEffect } from "react";
import GetDashboard from "../components/dashboard/GetDashboard";
import { useNavigate, useParams } from "react-router";
import Title from "../components/Title";
import { useDispatch } from "react-redux";
import { saveTourSteps } from "../redux/reducers/TourStepsReducer";
import dashboardJson from "../json/dashboardJson";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [dashboard, setdashboard] = useState({});
  const [loading, setloading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      if (id !== undefined) {
        getDashboard(id);
      } else {
        getDashboard(localStorage.getItem("PageLanding"));
      }
    } else {
      navigate("/", { replace: true, state: { from: "" } });
    }
    // eslint-disable-next-line
  }, [id]);

  const getDashboard = async (id) => {
    try {
      const dashboard = dashboardJson.find((x) => x.id === id);
      setdashboard(dashboard);
      const dashboardTour = dashboard.columns
        .filter((col) => {
          if (col.widget.data && col.widget.data.tourSection) {
            return col;
          }
        })
        .map((col) => {
          return {
            selector: `[data-tut=${col.widget.data.tourSection}]`,
            content: t(`tour-mssg.${col.widget.label}`),
            position: "top"
            // style: { backgroundColor: "#abd4d2" },
          };
        });
      dispatch(saveTourSteps(dashboardTour));
      setloading(false);
    } catch (e) {
      console.error("Problem", e);
      setloading(false);
    }
  };

  return (
    <React.Fragment>
      <Title title="Dashboard" />
      {loading ? (
        <div className="h-[300px] w-full bg-white flex justify-center items-center rounded-md">
          <Loader />
        </div>
      ) : (
        <GetDashboard dashboard={dashboard} />
      )}
    </React.Fragment>
  );
};

export default Dashboard;
