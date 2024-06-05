import React, { useState, useEffect } from "react";
import "../styles/loader.css";
import GetDashboard from "../components/dashboard/GetDashboard";
import { useNavigate, useParams } from "react-router-dom";
import Title from "../components/Title";
import { useDispatch } from "react-redux";
import { saveTourSteps } from "../redux/reducers/TourStepsReducer";
import dashboardJson from "../json/dashboardJson";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [dashboard, setdashboard] = useState([]);
  const [classnameArray, setclassnameArray] = useState([]);
  const [loading, setloading] = useState(true);
  const [defaultQuery, setDefaultQuery] = useState("");

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
      let classArray = [];
      dashboard?.columns?.forEach((row) => {
        let item = "";
        if (row?.colxs) {
          item += " col-span-" + row?.colxs;
        }
        if (row?.colmd) {
          item += " md:col-span-" + row?.colmd;
        }
        if (row?.collg) {
          item += " lg:col-span-" + row?.collg + " ";
        }
        if (!row?.colxs && !row?.colmd && !row?.collg) {
          item += "col-span-12";
        }
        classArray.push(item);
      });
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
            content: col.widget.data.tourMessage,
            position: "top"
            // style: { backgroundColor: "#abd4d2" },
          };
        });
      dispatch(saveTourSteps(dashboardTour));
      setclassnameArray(classArray);
      if (localStorage.getItem("DashboardDefaultFilter")) {
        setDefaultQuery(localStorage.getItem("DashboardDefaultFilter"));
      }
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
        <div style={{ height: "300px", backgroundColor: "white" }}>
          <div
            style={{
              marginLeft: "45%",
              marginTop: "150px",
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <GetDashboard
          dashboard={dashboard}
          classnameArray={classnameArray}
          DefaultQuery={defaultQuery}
        />
      )}
    </React.Fragment>
  );
};

export default Dashboard;
