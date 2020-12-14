
pull:
	git pull origin master && npm run build && pm2 restart chillspot-server

fetch:
	git fetch --all && git reset --hard origin/master

restart:
	pm2 restart chillspot-server

stop:
	pm2 stop chillspot-server

delete:
	pm2 delete chillspot-server

logs:
	pm2 logs