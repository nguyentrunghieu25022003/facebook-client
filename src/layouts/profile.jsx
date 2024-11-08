import PropTypes from "prop-types";
import Header from "../components/header-only/index";

const ProfileLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

ProfileLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProfileLayout;
