export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = randomId();

  req.requestId = requestId;

  console.log(
    JSON.stringify({
      level: "info",
      msg: "Incoming request",
      requestId,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      time: new Date().toISOString()
    })
  );

  res.on("finish", () => {
    console.log(
      JSON.stringify({
        level: "info",
        msg: "Request completed",
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Date.now() - start,
        time: new Date().toISOString()
      })
    );
  });

  next();
};

const randomId = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
