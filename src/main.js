// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import * as VueGoogleMap from "vue3-google-map";
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueGoogleMap, {
  apiKey: "AIzaSyDKI7W8sDzuB5X7XO5BeXBJp1JiVnSmeJw", // <-- THAY BẰNG API KEY CỦA BẠN
});
app.mount("#app");
