import PropTypes from "prop-types";
import Header from "../components/header-only/index";
import Sidebar from "../components/sidebar";

const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#E4E6E9", paddingTop: "60px" }}>
        <main className="container">
          <div className="row">
            <div className="col-xl-4">
              <Sidebar />
            </div>
            <div className="col-xl-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DefaultLayout;