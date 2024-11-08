import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import App from "./App.jsx";
import GlobalStyles from "./components/GlobalStyles/index";
import Modal from "react-modal";
import store from "./redux/store";
import { SocketProvider } from "./utils/socket.jsx";

Modal.setAppElement("#root");
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <GlobalStyles>
          <App />
        </GlobalStyles>
      </SocketProvider>
    </Provider>
  </StrictMode>
);