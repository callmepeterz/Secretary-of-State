const https = require("node:https");
module.exports = async function (url){
    return new Promise(resolve => {
        let data = [];
        let urlparts = url
            .replace("https://", "")
            .replace("http://", "")
            .split("/");
        let host = urlparts[0];
        let p = "/" + urlparts.slice(1).join("/");

        https.request({
            hostname: host,
            path: p,
            method: "GET"
        }, (res) => {
            res.on("data", (chunk) => data.push(chunk));
            res.on("end", () => resolve(data));
            res.on("error", (err) => console.error(err));
        }).end();
    });
}