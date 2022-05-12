const randomNumber = (number) => {
  let obj = {};
  if (number) {
    for (let i = 0; i < number; i++) {
      let random = Math.floor(Math.random() * 1000);
      if (obj[random]) {
        obj[random]++;
      } else {
        obj[random] = 1;
      }
    }
  }
  return obj;
};

process.on("message", (msg) => {
  if (!isNaN(msg)) {
    const result = randomNumber(msg);
    process.send({
      result,
    });
  } else {
    throw new Error("query param must be a number");
  }
});
