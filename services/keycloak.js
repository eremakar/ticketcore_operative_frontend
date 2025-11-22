import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://185.47.167.26:8080", // Базовый URL Keycloak
  realm: "ktj",
  clientId: "ticketcore",
});

export default keycloak;
