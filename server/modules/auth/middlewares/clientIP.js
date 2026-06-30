// Gets the visitor's real IP address from the request
 const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress;
  };

  module.exports=getClientIp