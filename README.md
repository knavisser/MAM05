# MAM05
MAM05 project

## To start hadoop:
1. Open CLI as admin and navigate to hadoop root folder. Then do cd sbin
2. Run start-dfs.cmd. Two command prompts should open, don't close them. Run jps to check if they're up.
3. Run start-yarn.cmd. Two additional command prompts should open, don't close them. Run jps to check if they're up.
4. To visually check the cluster, check on localhost:9870 for hadoop cluster and localhost:8088 for resource manager

## To run server:
1. Navigate to MAM05/server (cd mam05, cd server)
2. Run NPM install (only have to do this the first time)
3. Run node server.js --> this starts the server
4. Now you can open frontend on localhost:3000/dashboard.html

### Caveats:
- If you make changes to server.js, you have to restart the server. Go to cmd prompt where you started the server, press ctrl+c, then run node server.js again
- If you make change to frontend (anything in server/frontend/) you only have to reload the browser.