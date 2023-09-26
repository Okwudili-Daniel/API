import http, { IncomingMessage, ServerResponse } from "http"
import axios from "axios"
import path from "path"
import fs from "fs"

const port = 4500

interface IMessage {
    message: string
    success: boolean
    data: null | {} | {}[]
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse<IncomingMessage>) =>{
   res.setHeader("Content-Type", "application/json")

   const {method, url} = req
   let status = 404;

   let response:IMessage ={
    message: "Failed",
    success: false,
    data: null
   }

   if (method === "POST" && url === "/") {
    let requestBody =""
    
    req.on("data", (chunk) =>{
        requestBody += chunk;

    }).on("end", async() =>{
        let requestData = JSON.parse(requestBody)

        const {username} = requestData;

        if(!username || !requestData){
            status = 400;

            (response.message = "No request data");
            (response.success = false);
            (response.data = null);

            res.write(JSON.stringify({status, response}))
            res.end();
        }

        const githubendpoint = await axios.get(`https://api.github.com/users/${username}`);

        if (githubendpoint.status) {
            const userdetails = githubendpoint.data;

            const useravatar = userdetails.avatar_url;
            const avatarfilename = `${username}_avatar.jpg`;
            const avatarfolder = path.join(__dirname, "Githubavatar", avatarfilename);

            const getavatarurl = await axios.get(useravatar, {responseType: "stream",})

            getavatarurl.data.pipe(fs.createWriteStream(avatarfolder))

            status = 200;

            (response.message = `${userdetails?.name ? userdetails?.name : username} Github details gotten`),
            (response.success = true),
            (response.data = userdetails)
            res.write(JSON.stringify({status, response}))
            res.end()            
        }else{
            status = 404;

            (response.message = "User not found");
            (response.success = false);
            (response.data = null)
            res.write(JSON.stringify({status, response}))
            res.end()
        }
    });
   }else{
        status = 404;
        (response.message = "Check router");
        (response.success = false);
        (response.data = null);
        res.write(JSON.stringify({status, response}))
        res.end()
   }
   
})

server.listen(port, () =>{
    console.log("Awaiting");
    
})