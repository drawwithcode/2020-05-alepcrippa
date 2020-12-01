//loading express library to simulate a server
let express = require("express");
let app = express();

//set up the local host
let port = process.env.PORT || 3000;
let server = app.listen(port);

//saying that what is inside the public folder has to be sent to the clients
app.use(express.static("public"));

//creating WEBSOCKETS
let socket = require("socket.io"); //loading socket.io library on the server
let io = socket(server);

//messages
io.on("connection", newConnection) //"connection" is the default message sent by clients who connect

function newConnection(sock){
  console.log("new connection: " + sock.client.id);

  sock.on("mousee", mouseMessage);

  function mouseMessage(dataMouse){
    console.log(sock.client.id);
    sock.broadcast.emit("mouseBroad", dataMouse);
  }

}
