const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port = 3000

const imageSize = require('image-size')

var fs = require('fs');
var { MailListener } = require("mail-listener5");   

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/slideDeck', (req, res) => {
    console.log("SlideDeck requested. Current folder:" + __dirname);
    var images=[];
    try {
        const files = fs.readdirSync(mailListener.attachmentOptions.directory);
        // files object contains all files names
        // log them on console
        files.forEach(file => {
            // console.log(file)
            let dim = imageSize(mailListener.attachmentOptions.directory+"/"+file)
            // console.log(dim)
            images.push({data:fs.readFileSync(mailListener.attachmentOptions.directory+"/"+file),
                            height: dim.height,
                            width: dim.width})
        });
        
    
    } catch (err) {
        console.log(err);
    }
    res.json(images)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



var mailListener = new MailListener({
    username:"BotRTXEmail96@gmail.com",
    password:"vqFW#@3fAu$T",
    host:"imap.gmail.com",
    port:993,
    tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    debug: console.log, // Or your custom function with only one incoming argument. Default: null
    tlsOptions: { rejectUnauthorized: false },
    mailbox: "INBOX", // mailbox to monitor
    searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
    markSeen: true, // all fetched email will be marked as seen and not fetched next time
    fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
    attachments: false, // download attachments as they are encountered to the project directory
    attachmentOptions: { directory: "slideDeck/" } // specify a download directory for attachments
});

mailListener.start();
mailListener.on("error", function(err){
    console.log(err);
 });
mailListener.on("attachment", async function(att, path, seqno){
    console.log(att);
    console.log(path)
    if(att.contentType.includes('image')){
        await fs.writeFile(`${mailListener.attachmentOptions.directory}${att.filename}`, att.content, (error) =>{
            console.log('error', error);
          });
          var files = fs.readdirSync(mailListener.attachmentOptions.directory)
          if (files.length > 30){
            var filesToMove = []
            for(var file of files){
                let seconds = fs.stat(`${mailListener.attachmentOptions.directory}${file}`, function(err, stats){
                    return (new Date().getTime() - stats.mtime) / 1000;
                });
                let tempFile = {path: `${mailListener.attachmentOptions.directory}${file}`,
                            name: file,
                            age: seconds}
                if (tempFile.age > 86400){
                    if (files.length - filesToMove.length > 30)
                        filesToMove.push(tempFile)
                    else{
                        for(let i in filesToMove){
                            if (tempFile.age > filesToMove[i].age){
                                filesToMove.splice(i, 1, tempFile)
                            }
                        }
                    }
                }
            }
            for(let i of filesToMove){
                fs.rename(i.path, `./fileArchive/${i.name}`)
                console.log(`Moved ${i.name}`)
            }
          }
        //   mailListener.emit('attachment', att, `${mailListener.attachmentOptions.directory}${att.filename}`, seqno);
    }
})