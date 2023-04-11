const express = require('express');
const morgan = require('morgan');

const PORT = process.env.PORT || 8001;
const app = express();


app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const server = app.listen(PORT, function() {
  console.log("server is listening on port " + PORT);
});

const io = require("socket.io")(server);

io.on("connection", function(socket) {
  socket.on("user message", (text) => {

    const arr = text.split(' ');
    const lastWord = arr[arr.length-1];
    const msg1 = `Here are some results for ${text}`;
    const msg2 = `Here is the current weather in ${lastWord}`;
    const msg3 = `Here's the current time in ${lastWord}`;
    const msg4 = `Let's get funky!`
    const msg5 = `Here is a useful app for shows near you.`

    const end = `Transmission ended.`;

    console.log(text);

    const searchQuery = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    const showFinder = `https://www.showfinder.ninja/`

    if (text.includes("weather") || text.includes("temperature")) {
      socket.emit("bot message", { msg: msg2, link: searchQuery });
    } else if (text.includes("time")) {
      socket.emit("bot message", { msg: msg3, link: searchQuery });
    } else if (text.includes("Prince") || text.includes("James Brown")) {
      socket.emit("bot message", { msg: msg4, link: searchQuery });
    } else if (text.includes("show finder") || text.includes("shows") || text.includes("shows near me")) {
      socket.emit("bot message", { msg: msg5, link: showFinder });
    } else if (text.includes("end transmission") || text.includes("and transmission")
    || text.includes("close transmission")) {
      socket.emit("bot message", { msg: end, link: null });
    } else {
      socket.emit("bot message", { msg: msg1, link: searchQuery });
    }
  });
});

// hardcoded keywords
// const keywordList = [
  //   {

  
//     keyword: "bandcamp",
//     msg: "Music time!",
//     link: "https://bandcamp.com/",
//   },
//   {
//     keyword: "reproducing piano",
//     msg: "This guy is nuts. Check it out.",
//     link: "https://www.youtube.com/watch?v=LFz2lCEkjFk&ab_channel=JuergenHocker",
//   },
//   {
//     keyword: "cedar tree",
//     msg: "ok.",
//     link: "https://en.wikipedia.org/wiki/Cedrus",
//   },
// ];

// io.on("connection", function (socket) {
  //   socket.on("user message", (text) => {
    //     keywordList.forEach(({ keyword, msg, link }) => {
      //       if (text.includes(keyword)) {
        //         socket.emit("bot message", { msg, link });
        //       }
        //     });
        //   });
        // });