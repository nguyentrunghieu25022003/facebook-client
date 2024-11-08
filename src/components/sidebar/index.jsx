import classNames from "classnames/bind";
import styles from "./sidebar.module.scss";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import HistoryIcon from "@mui/icons-material/History";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EventNoteIcon from "@mui/icons-material/EventNote";

const cx = classNames.bind(styles);

const category = [
  {
    icon: <PeopleAltIcon className={cx("icon")} />,
    text: <p className="fs-4">Find Friends</p>,
  },
  {
    icon: <HistoryIcon className={cx("icon")} />,
    text: <p className="fs-4">Memories</p>,
  },
  {
    icon: <BookmarkIcon className={cx("icon")} />,
    text: <p className="fs-4">Saved</p>,
  },
  {
    icon: <OndemandVideoIcon className={cx("icon")} />,
    text: <p className="fs-4">Videos</p>,
  },
  {
    icon: <StorefrontIcon className={cx("icon")} />,
    text: <p className="fs-4">Marketplace</p>,
  },
  {
    icon: <EventNoteIcon className={cx("icon")} />,
    text: <p className="fs-4">Events</p>,
  },
];

const Sidebar = () => {
  return (
    <div className={cx("sidebar")}>
      <div className="container">
        <div className="row">
          {category.map((item, index) => {
            return (
              <div className="col-xl-12" key={index}>
                <div className={cx("wrapper")}>
                  {item.icon} <b className="fw-bold">{item.text}</b>
                </div>
              </div>
            );
          })}
          <div className="col-xl-12 pt-4">
            <ul className="d-flex flex-wrap gap-4 ml-3" style={{ paddingLeft: "10px" }}>
              <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">Privacy<span className="d-block">·</span></li>
              <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">Terms<span className="d-block">·</span></li>
              <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">Ads<span className="d-block">·</span></li>
              <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">Ad choices<span className="d-block">·</span></li>
              <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">Cookie<span className="d-block">·</span></li>
              <li className="fs-5 fw-normal text-secondary d-flex align-items-center gap-3">See more<span className="d-block">·</span></li> 
              <li className="fs-5 fw-normal text-secondary">Meta © 2024</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
