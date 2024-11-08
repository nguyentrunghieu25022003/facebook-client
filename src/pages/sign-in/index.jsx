import classNames from "classnames/bind";
import styles from "./sign-in.module.scss";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";
import Modal from "react-modal";
import SignUp from "../sign-up/index";

const cx = classNames.bind(styles);

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (event) => {
    event.preventDefault();
    setModalIsOpen(true);
  };

  const closeModal = (event) => {
    event.preventDefault();
    setModalIsOpen(false);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/auth/sign-in`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setAccountStatus(true);
        const { user, accessToken, refreshToken } = response.data;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("isActive", JSON.stringify("home"));
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        setAccountStatus(false);
      }
    } catch (err) {
      setAccountStatus(false);
      console.error(err);
    }
  };

  return (
    <>
      <div className={cx("auth")}>
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-md-6">
              <div className="mt-5">
                <img
                  src="/imgs/4lCu2zih0ca.svg"
                  alt="Error"
                  className={cx("logo")}
                />
                <p className={cx("tagline")}>
                  Facebook helps you connect and share with <br /> the people in
                  your life.
                </p>
              </div>
            </div>
            <div className="col-xl-5 col-md-6">
              <div>
                <form className="text-center" onSubmit={handleSignIn}>
                  <div className="input-group input-group-lg mb-3">
                    <input
                      type="text"
                      className="form-control fs-4"
                      placeholder="Email address or phone number"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      autoComplete="current-email"
                      required
                    />
                  </div>
                  <div className="input-group input-group-lg mb-3">
                    <input
                      type="password"
                      className="form-control fs-4"
                      placeholder="Password"
                      name="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  { !accountStatus && <strong className="fs-4 fw-medium text-danger">Account or password is incorrect.</strong> }
                  <div className="d-grid gap-2 mt-3">
                    <button
                      className="btn btn-primary fs-3 fw-medium"
                      type="submit"
                    >
                      Log in
                    </button>
                  </div>
                  <p className="mt-4 mb-5">
                    <Link className="link-opacity-100 fs-5 fw-bold">
                      Forgotten password?
                    </Link>
                  </p>
                  <div className={cx("border")}></div>
                  <button
                    className="btn btn-success fs-4 fw-medium mt-5 mb-3"
                    onClick={openModal}
                  >
                    Create new account
                  </button>
                </form>
                <p className={cx("page-create-link")}>
                  <strong className="fw-bold">Create a Page</strong> for a
                  celebrity, brand or business.
                </p>
              </div>
            </div>
          </div>
          <Modal
            isOpen={modalIsOpen}
            contentLabel="Sign Up"
            className={cx("modal")}
          >
            <SignUp closeModal={closeModal} />
          </Modal>
        </div>
      </div>
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-xl-12 col-md-12 col-sm-12 col-12">
              <ul className="fs-5 pt-5 pb-3">
                <li>English (UK)</li>
                <li>Vietnamese</li>
                <li>中文(台灣)</li>
                <li>한국어</li>
                <li>日本語</li>
                <li>Français (France)</li>
                <li>ภาษาไทย</li>
                <li>Español</li>
                <li>Português (Brasil)</li>
                <li>Deutsch</li>
                <li>Italiano</li>
              </ul>
              <div className={cx("border")}></div>
              <p className="fs-5 pt-3 pb-3">Meta © 2024</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default SignIn;
