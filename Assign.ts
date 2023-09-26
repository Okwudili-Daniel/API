import axios from "axios"
import http, { IncomingMessage, ServerResponse } from "http"

const port = 3000

interface IMessage{
    message: string
    success: boolean
    data: null | {} | {}[] | []
}

const server = http.createServer((req:IncomingMessage, res:ServerResponse<IncomingMessage>) =>{
    res.setHeader("Content-Type", "application/json")

    const {method, url} = req
    let status = 404;
    let response= {
        message: "Failed",
        success: false,
        data: null
    }

    let Container = ""

    req.on("data", (chunk) =>{
        Container += chunk

    }).on("end",async () =>{

        if(method === "GET"){
            let Link = url?.split("/")[1];
            let To = Link?.toString()

            

            const unLink = await axios.get("https://fakestoreapi.com/products")

            const store = unLink.data;

            let Data = store.some((el) =>{
                return el.category === To
            });

            if(Data === false){
                status = 400;

            (response.message = "No request data");
            (response.success = false);
            (response.data = null);

            res.write(JSON.stringify({status, response}))
            res.end();

            }else{
                const Category = Data.filter((el) =>{
                    return el.category === To
                })
            }
        }else{
            status = 404;

            response.message = "bad request"
            response.success = true
            response.data = null
        }
    })
})