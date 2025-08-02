// Get the current environment
const NODE_ENV = process.env.NODE_ENV || "dev";


// Export configuration object with all environment variables
const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: NODE_ENV,

  // Database configuration
  database: {
    url: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "7d", // Token expiration time
  },

  // Email configuration
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    service: process.env.EMAIL_SERVICE || "gmail",
  },

  // File storage
  uploads: {
    root: process.env.UPLOADS_ROOT || "",
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

// Log the current environment (for debugging)
console.log(`Application running in ${NODE_ENV} environment`);

export default config;
