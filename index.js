const express = require('express')
const cors = require('cors')
const config = require('./config.json')
const app = express()
app.use(cors())
const port = 3000

const imageSize = require('probe-image-size')

var fs = require('fs');
var { MailListener } = require("mail-listener5");   

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/slideDeck', (req, res) => {
    console.log("SlideDeck requested. Current folder:" + __dirname);
    
    try {
        getImgs(fs.readdirSync(__dirname+"/"+mailListener.attachmentOptions.directory)).then( results => {
            res.json(results)
        })
    
    } catch (err) {
        console.log(err);
        res.status(400).send("error")
    }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

async function getImgs(files){
    var images=[];
    
    // files object contains all files names
    // log them on console
   for(let i =0; i < files.length; i++) {
        // console.log(file)
        file = files[i]
        try{
            let dim = await imageSize(require('fs').createReadStream(__dirname+"/"+mailListener.attachmentOptions.directory+"/"+file))
            console.log(dim)
            if(dim.orientation && dim.orientation > 5){
            images.push({data:fs.readFileSync(__dirname+"/"+mailListener.attachmentOptions.directory+"/"+file),
                            height: dim.width,//probe-image-size switches the height and width???
                            width: dim.height})
            } else {
                images.push({data:fs.readFileSync(__dirname+"/"+mailListener.attachmentOptions.directory+"/"+file),
                            height: dim.height,
                            width: dim.width})
            }
        } catch (e){
            console.log(e)
        }
    }
    return images;
}


var mailListener = new MailListener({
    username: config.emailUsername,
    password: config.emailPassword,
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
        await fs.writeFile(`${__dirname}/${mailListener.attachmentOptions.directory}${att.filename}`, att.content, (error) =>{
            console.log('error', error);
          });
          var files = fs.readdirSync(__dirname+"/"+mailListener.attachmentOptions.directory)
          if (files.length > 30){
            var filesToMove = []
            for(var file of files){
                let seconds = fs.stat(`${__dirname}/${mailListener.attachmentOptions.directory}${file}`, function(err, stats){
                    return (new Date().getTime() - stats.mtime) / 1000;
                });
                let tempFile = {path: `${__dirname}/${mailListener.attachmentOptions.directory}${file}`,
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
                fs.rename(i.path, `${__dirname}/fileArchive/${i.name}`)
                console.log(`Moved ${i.name}`)
            }
          }
        //   mailListener.emit('attachment', att, `${mailListener.attachmentOptions.directory}${att.filename}`, seqno);
    }
})