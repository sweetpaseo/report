cd /home/u544113687/domains/report.erihome.id/nodejs
unzip -o deploy_final.zip
rm -rf node_modules/rimraf-c930fd2d2ea593d1
cp -r node_modules/rimraf node_modules/rimraf-c930fd2d2ea593d1
touch tmp/restart.txt
