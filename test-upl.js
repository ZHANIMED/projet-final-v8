const fs = require("fs");
const FormData = require("form-data");

(async () => {
  try {
    const formData = new FormData();
    formData.append("title", "Test Prod Title " + Date.now());
    formData.append("description", "A description");
    formData.append("price", "100");
    formData.append("category", "69b1c9671549a1a89f67963d"); // Sample category ID from logs
    formData.append("stock", "5");
    formData.append("image", "");
    
    // Auth Token isn't easily accessible here but the route needs IsAuth and IsAdmin.
    // So this script will likely return 401 Unauthorized unless we skip auth.
    // Instead we will mock fetching directly from the backend to see the payload schema error.
    
    console.log("Mocking payload..."); 
  } catch (err) {
    console.error(err);
  }
})();
