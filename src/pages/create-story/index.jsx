import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./create-story.module.scss";
import CloseIcon from "@mui/icons-material/Close";

const cx = classNames.bind(styles);

const CreateStory = ({ closeModal }) => {
    return (
        <div className={cx("create-story")}>
            <div className="container">
                <div className="row">
                    <div className="col-xl-12">
                        <h4>Your story</h4>
                        <span onClick={closeModal}>
                            <CloseIcon />
                        </span>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-6">
                        A
                    </div>
                    <div className="col-xl-6">
                        var(--button-color)
                    </div>
                </div>
            </div>
        </div>
    );
};

CreateStory.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default CreateStory;