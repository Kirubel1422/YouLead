import io from "socket.io-client";

const URL = import.meta.env.VITE_DEV_ENDPOINT;

export const socket = io(URL, { autoConnect: false, transports: ["websocket"] });
