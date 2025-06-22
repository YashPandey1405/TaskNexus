import { useEffect } from "react";

export default function BootstrapLoader() {
  useEffect(() => {
    // Dynamically import Bootstrap JS bundle on client side
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => {
        // Bootstrap JS loaded successfully
      })
      .catch((err) => {
        console.error("Failed to load Bootstrap JS:", err);
      });
  }, []);

  return null;
}
