export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH
cd /home/u544113687/domains/report.erihome.id/nodejs/
git pull origin main > build.log 2>&1
npm run build >> build.log 2>&1
touch tmp/restart.txt
