
var fs = require('fs');

var { MailListener } = require("mail-listener5");   

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
    attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
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
        //   mailListener.emit('attachment', att, `${mailListener.attachmentOptions.directory}${att.filename}`, seqno);
    }
})