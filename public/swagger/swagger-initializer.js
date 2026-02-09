window.onload = function() {
  window.ui = SwaggerUIBundle({
    url: "../swagger.yaml", // Ścieżka do Twojego pliku YAML
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });
};
