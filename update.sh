cd /home/dietpi/Frameify
git -C /home/dietpi/Framify/ reset --hard HEAD
output = $(git pull | grep "Already up to date")
if [[ -z $output ]]
then
    cp /home/dietpi/Framify/index.html /var/www/index.html
    npm install
    forever stopall
    forever start /home/dietpi/Frameify/index.js
fi