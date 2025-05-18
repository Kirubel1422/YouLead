import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/animations.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { persistor, store } from "@/store/store.ts";
import { ToastProvider } from "./components/Toast.tsx";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")!).render(
     <Provider store={store}>
          <BrowserRouter>
               <PersistGate persistor={persistor}>
                    <ToastProvider>
                         <App />
                    </ToastProvider>
               </PersistGate>
          </BrowserRouter>
     </Provider>,
);
