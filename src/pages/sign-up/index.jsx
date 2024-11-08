import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./sign-up.module.scss";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import HelpIcon from "@mui/icons-material/Help";
import { useState } from "react";

const cx = classNames.bind(styles);

const SignUp = ({ closeModal }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedOption, setSelectedOption] = useState("male");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/auth/sign-up`,
        {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          dateOfBirth: dateOfBirth,
          gender: selectedOption,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Success !");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={cx("auth")}>
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <form onSubmit={handleSignUp}>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="fs-1 fw-bold">Sign Up</h4>
                  <p className="fs-5 pt-2">Its quick and easy.</p>
                </div>
                <span onClick={closeModal}>
                  <CloseIcon className="fs-1" />
                </span>
              </div>
              <div className={cx("border")}></div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control fs-4"
                  placeholder="First name"
                  name="firstName"
                  onChange={(e) => {
                    setFirstName(e.target.value);
                  }}
                />
                <input
                  type="text"
                  className="form-control fs-4"
                  placeholder="Surname"
                  name="lastName"
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                />
              </div>
              <div className="input-group input-group-lg mb-3">
                <input
                  type="text"
                  className="form-control fs-4"
                  placeholder="Email address or phone number"
                  name="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="input-group input-group-lg mb-3">
                <input
                  type="password"
                  className="form-control fs-4"
                  placeholder="New password"
                  name="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                />
              </div>
              <label className="d-flex align-items-center gap-2 pb-2 fs-5">
                Date of birth <HelpIcon className="fs-5" />
              </label>
              <div className="input-group input-group-lg mb-3">
                <input
                  type="date"
                  className="form-control fs-4"
                  name="dateOfBirth"
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <label className="d-flex align-items-center gap-2 pb-2 fs-5">
                Gender <HelpIcon className="fs-5" />
              </label>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="form-check d-flex align-items-center gap-3 fs-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="exampleRadios1"
                    value="male"
                    checked={selectedOption === "male"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label mt-2"
                    htmlFor="exampleRadios1"
                  >
                    Male
                  </label>
                </div>
                <div className="form-check d-flex align-items-center gap-3 fs-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="exampleRadios2"
                    value="female"
                    checked={selectedOption === "female"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label mt-2"
                    htmlFor="exampleRadios2"
                  >
                    Female
                  </label>
                </div>
                <div className="form-check d-flex align-items-center gap-3 fs-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="exampleRadios3"
                    value="other"
                    checked={selectedOption === "other"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label mt-2"
                    htmlFor="exampleRadios3"
                  >
                    Other
                  </label>
                </div>
              </div>
              <p className="fs-5 pt-4 pb-4">
                People who use our service may have uploaded your contact
                information to Facebook.{" "}
                <strong className="fw-bold">Learn more.</strong>
              </p>
              <p className="fs-5 pb-5">
                By clicking Sign Up, you agree to our Terms,{" "}
                <strong className="fw-bold">Privacy Policy</strong> and{" "}
                <strong className="fw-bold">Cookies Policy</strong>. You may
                receive SMS notifications from us and can opt out at any time.
              </p>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success fs-3 fw-medium"
                  type="submit"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

SignUp.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default SignUp;
