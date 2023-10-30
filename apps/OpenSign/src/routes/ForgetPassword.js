import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchAppInfo, forgetPassword } from "../redux/actions";
import Title from "../components/Title";
import { NavLink } from "react-router-dom";
import login_img from "../assets/images/login_img.svg";

class forgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      hideNav: ""
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  resize = () => {
    let currentHideNav = window.innerWidth <= 760;
    if (currentHideNav !== this.state.hideNav) {
      this.setState({ hideNav: currentHideNav });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();

    localStorage.setItem("appLogo", this.props.appInfo.applogo);
    localStorage.setItem("appName", this.props.appInfo.appname);
    localStorage.setItem("defaultmenuid", this.props.appInfo.defaultmenuid);
    localStorage.setItem("PageLanding", this.props.appInfo.LandingPageId);
    localStorage.setItem(
      "userSettings",
      JSON.stringify(this.props.appInfo.settings)
    );
    const { email } = this.state;
    if (email) {
      this.props.forgetPassword(email);
    }
  };

  componentDidMount() {
    this.props.fetchAppInfo(localStorage.getItem("domain"));
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  render() {
    const { email } = this.state;
    let image = this.props.appInfo.applogo;
    return (
      <div className="bg-white">
        <Title title="Forgot password page" />
        <div>
          <div className="md:m-10 lg:m-16 md:p-4 lg:p-10 p-5 bg-[#ffffff] md:border-[1px] md:border-gray-400 ">
            <div className="w-[250px] h-[66px] inline-block">
              {this.state.hideNav ? (
                <img src={image} width="100%" alt="" />
              ) : (
                <img src={image} width="100%" alt="" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
              <div className="">
                <form onSubmit={this.handleSubmit}>
                  <h2 className="text-[30px] mt-6">Welcome Back !</h2>
                  <span className="text-[12px] text-[#878787]">
                    Reset Your Password
                  </span>
                  <div className="shadow-md rounded my-4">
                    <div className="px-6 py-4">
                      <label className="block text-xs">Email</label>
                      <input
                        type="text"
                        className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                        name="email"
                        value={email}
                        onChange={this.handleChange}
                        required
                      />
                      <hr className="my-2 border-none" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <button
                      type="submit"
                      className="rounded-sm bg-[#3ac9d6] text-white px-4 py-3 text-xs font-semibold shadow uppercase"
                    >
                      Submit
                    </button>
                    <NavLink
                      to="/"
                      className="rounded-sm bg-white border-[1px] border-[#15b4e9] text-[#15b4e9] px-4 py-3 text-xs font-semibold shadow uppercase"
                    >
                      Login
                    </NavLink>
                  </div>
                </form>
              </div>
              {!this.state.hideNav && (
                <div className="self-center">
                  <div className="mx-auto md:w-[300px] lg:w-[500px]">
                    <img src={login_img} alt="bisec" width="100%" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { appInfo: state.appInfo, forgotPassword: state.forgotPassword };
};

export default connect(mapStateToProps, { fetchAppInfo, forgetPassword })(
  forgotPassword
);
