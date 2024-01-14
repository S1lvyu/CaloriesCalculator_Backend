const corsOptions = {
  origin: "*",

  methods: "GET,POST,PUT,DELETE,UPDATE,PATCH",

  optionsSuccessStatus: 204,
};

module.exports = {
  corsOptions,
};
