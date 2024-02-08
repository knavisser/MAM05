# MAM05
MAM05 project

## To start hadoop:
1. Open CLI as admin and navigate to hadoop root folder. Then do cd sbin
2. Run start-dfs.cmd. Two command prompts should open, don't close them. Run jps to check if they're up.
3. Run start-yarn.cmd. Two additional command prompts should open, don't close them. Run jps to check if they're up.
4. To visually check the cluster, check on localhost:9870 for hadoop cluster and localhost:8088 for resource manager