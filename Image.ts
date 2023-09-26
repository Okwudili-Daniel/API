import axios from "axios";
import http, { IncomingMessage, ServerResponse } from "http";
import path from "path";
import fs, { existsSync } from "fs";
import { error } from "console";

interface iMessage {
  message: string;
  success: boolean;
  data: null | {}[] | [] | {};
}

const port: number = 3000;

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    res.setHeader("content-type", "Application/JSON");

    let response: iMessage = {
      message: "Failed to get request made",
      success: false,
      data: null,
    };
    let status = 404;
    let holder = "";

    req
      .on("data", (chunk) => {
        holder += chunk;
      })
      .on("end", async () => {
        const { method, url } = req;

        //Download all image
        if (method === "GET" && url === "/") {
          const fakeStore = await axios.get("http://fakestoreapi.com/products");

          var count1 = 1;
          if (fakeStore.status) {
            for (let i = 1; i < fakeStore.data.length; i++) {
              const Images = await axios.get(`${fakeStore.data[i].image}`, {
                responseType: "stream",
              });
              Images.data.pipe(
                fs.createWriteStream(
                  path.join(__dirname, "./fakeStoreImages", `${count1++}.jpg`)
                )
              );
            }
          }
          response.message = "Images downloaded succesfully";
          res.write(JSON.stringify({ response , status}));
          res.end();
        }
      });
  }
);

server.listen(port, () => {
  console.log("Server up and running");
});