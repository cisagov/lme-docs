---
title: Troubleshooting Logging Made Easy Install
---

# Troubleshooting Logging Made Easy (LME) Install

## Installation

Installing LME involves preparing the system environment, meeting hardware requirements, and configuring components to ensure smooth setup and operation.

**Note: Make sure to use `-i` to run a login shell with any commands that run as root, so that environment variables are set properly. For more information, reference [Unix and Linux](https://unix.stackexchange.com/questions/228314/sudo-command-doesnt-source-root-bashrc).**

**Note: Service startup may take several minutes--please allow time before assuming an issue has occurred.**

- **Confirm Services Are Installed**
  
  - To confirm services are installed, run:
    
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl list-unit-files lme\*
    ```

  - Debug if necessary; to check the status of individual services listed above, run:
    
    ```bash
    #if something breaks, use these commands to debug:
    SERVICE_NAME=lme-elasticsearch.service
    sudo -i journalctl -xu $SERVICE_NAME
    ```

  - If something is broken, try restarting the services and making sure failed services reset before starting by running:
    
    ```bash
    #try resetting failed: 
    sudo -i systemctl  reset-failed lme*
    sudo -i systemctl  restart lme.service
    ```

- **Verify Containers are Running and Healthy**
  
  - To verify, run:
  
    ```bash
    sudo -i podman ps --format "{{.Names}} {{.Status}}"
    ```  

  - Example output:
    
    ```shell
    lme-elasticsearch Up 19 hours (healthy)
    lme-wazuh-manager Up 19 hours
    lme-kibana Up 19 hours (healthy)
    lme-fleet-server Up 19 hours
    lme-elastalert2 Up 17 hours
    ```

  - This also prints the names of the containers in the first column of text on the left. 

  **Note: We are currently missing health checks for Fleet Server and ElastAlert2. If those appear, they won't show healthy and that's expected. Health checks for these services will be added in a future version.**

  - If a container is missing, check its logs by running:
    
    ```bash
    #also try inspecting container logs: 
    CONTAINER_NAME=lme-elasticsearch #change this to your container name you want to monitor lme-kibana, etc...
    sudo -i podman logs -f $CONTAINER_NAME
    ```

- **Verify You Can Connect to Elastisearch**

  - To verify you can connect to Elasticsearch, run:
    
    ```bash
    #substitute your password below:
    curl -k -u elastic:$(sudo -i ansible-vault view /etc/lme/vault/$(sudo -i podman secret ls | grep elastic | awk '{print $1}') | tr -d '\n') https://localhost:9200
    ```

  - Example output:
    
    ```json
    {
      "name" : "lme-elasticsearch",
      "cluster_name" : "LME",
      "cluster_uuid" : "FOnfbFSWQZ-PD-rU-9w4Mg",
      "version" : {
        "number" : "8.12.2",
        "build_flavor" : "default",
        "build_type" : "docker",
        "build_hash" : "48a287ab9497e852de30327444b0809e55d46466",
        "build_date" : "2024-02-19T10:04:32.774273190Z",
        "build_snapshot" : false,
        "lucene_version" : "9.9.2",
        "minimum_wire_compatibility_version" : "7.17.0",
        "minimum_index_compatibility_version" : "7.0.0"
      },
      "tagline" : "You Know, for Search"
    }
    ```

- **Verify You Can Connect to Kibana**

  - To verify that Kibana is accessible, use a **Secure Shell (SSH) proxy** to forward a local port to the remote Linux host.
  
  - Log in as the **Elastic admin** using the `elastic` username and the password retrieved from the [Retrieving Passwords section](https://cisagov.github.io/lme-docs/docs/markdown/install/#51-retrieving-passwords) of the Install document.
 
  - Run the ***following command***:
    
    ```bash
    #connect via ssh if you need to 
    ssh -L 8080:localhost:5601 [YOUR-LINUX-SERVER]
    #go to browser:
    #https://localhost:8080
    ```

  - In your local browser, navigate to **Kibana** using the IP address you defined for `IPVAR`.

## Post-Installation

After completing the installation of LME, it's important to verify that all core components are set up correctly and functioning as expected. The following steps help confirm that dashboards for Elastic and Wazuh were properly installed:

- Run the ***following commands*** to verify that the dashboard installation was successful on `/opt/lme/dashboards/elastic/` and `/opt/lme/dashboards/wazuh/` directories:
  
  ```bash
  sudo -i 
  ls -al /opt/lme/FLEET_SETUP_FINISHED
  ls -al /opt/lme/dashboards/elastic/INSTALLED
  ls -al /opt/lme/dashboards/wazuh/INSTALLED
  ```

- It should appear as the following:

  ```bash
  root@ubuntu:~# ls -al /opt/lme/FLEET_SETUP_FINISHED
  -rw-r--r-- 1 root root 0 Oct 21 18:41 /opt/lme/FLEET_SETUP_FINISHED
  root@ubuntu:~# ls -al /opt/lme/dashboards/elastic/INSTALLED
  -rw-r--r-- 1 root root 0 Oct 21 18:44 /opt/lme/dashboards/elastic/INSTALLED
  root@ubuntu:~# ls -al /opt/lme/dashboards/wazuh/INSTALLED
  -rw-r--r-- 1 root root 0 Oct 21 19:01 /opt/lme/dashboards/wazuh/INSTALLED
  ```

**Note: If these files don't appear, something likely went wrong during installation. Review the output from Ansible carefully. If you suspect a bug, feel free to file an issue. Otherwise, for troubleshooting help related to your local setup, please start a discussion instead.**

## Logging Issues

### Space Issues During Install

If your system has size constraints and doesn't meet the expected requirements, you may encounter issues like the [Getting Error with Step 3.2.2 when Running the deploy.sh script](https://github.com/cisagov/LME/issues/19).

- You can try [DISK-SPACE-20.04](https://askubuntu.com/questions/1269493/ubuntu-server-20-04-1-lts-not-all-disk-space-was-allocated-during-installation):
  
  ```
  root@util:# vgdisplay
  root@util:# lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
  root@util:~# resize2fs /dev/mapper/ubuntu--vg-ubuntu--lv
  ```

### Containers Restarting/Not Running

If you're having issues with containers restarting, check both the ***host*** and the ***container logs*** (e.g., a wrong password could prevent Elastic Stack from operating properly).

- To inspect the container logs, run:  

  ```bash
  sudo -i podman ps --format "{{.Names}} {{.Status}}"
  ```  

- Use the ***container name*** found in the above output to check its logs by running:
  
  ```bash
  #Using the above name you found, check its logs here. 
  sudo -i podman logs -f $CONTAINER_NAME
  ```

- If this doesn’t resolve the issue, reference the next section for common problems that may be encountered.

## Container Troubleshooting

### Dependent Containers That Must be Removed

Sometimes Podman doesn't clean up containers properly when stopping and restarting the `lme.service`

- If you get the following error after inspecting the logs in systemd:
  
  ```bash
  #journal: 
  journalctl -xeu lme-elasticsearch.service
  #OR systemctl
  systemctl status lme*
  ```
  Error:

  ```bash
  ubuntu lme-elasticsearch[43436]: Error: container bf9cb322d092c13126bd0341a1b9c5e03b475599e6371e82d4d866fb088fc3c4 has dependent containers which must be removed before it: ff7a6b654913838050360a2cea14fa1fdf5be1d542e5420354ddf03b88a1d2c9: container already exists
  ```

  Then you'll need to do the following:
  
   - Kill the ***other containers*** it lists manually by running:
     
     ```bash
     sudo -i podman rm  ff7a6b654913838050360a2cea14fa1fdf5be1d542e5420354ddf03b88a1d2c9
     sudo -i podman rm  bf9cb322d092c13126bd0341a1b9c5e03b475599e6371e82d4d866fb088fc3c4
     ```
     
  - Remove ***other containers*** that are dead by running:
    
    ```bash
    sudo -i podman ps -a
    sudo podman rm $CONTAINER_ID
    ```
    
  - Restart the **`lme.service`** by running:
    
    ```bash
    systemctl restart lme.service
    ```

### Memory in Containers (Need More RAM/Less RAM Usage)

- If you're on a resource-constrained host and need to limit/edit the memory used by the containers, add the ***following*** into the quadlet file: 

  ```bash
  ....
   EnvironmentFile=/opt/lme/lme-environment.env
   Image=localhost/elasticsearch:LME_LATEST
   Network=lme
   PodmanArgs=--memory 8gb --network-alias lme-elasticsearch --health-interval=2s
   PublishPort=9200:9200
   Ulimit=memlock=-1:-1
   Volume=lme_certs:/usr/share/elasticsearch/config/certs
   ....
  ```

**Notes**

  - You don't need to run the commands listed above. Instead, modify the quadlet file you want to update.
  
    - If this is before you've installed LME, edit the ***quadlet file*** in the `~/LME/quadlet/lme-elasticsearch.container` directory of the cloned repository.

  - If this is after installation, edit the ***quadlet file*** located at `/etc/containers/systemd/lme-elasticsearch.container` by running `quadlet/lme-elasticsearch.container`. Add the line ***`--memory Xgb`*** with the number of Gigabytes you want to limit for the container.

  - You can repeat this for any containers you for which you want to limit the memory.

### Java Virtual Machine (JVM) Heap Size

If your server has a large amount of RAM (e.g., greater than 128GB) and you want your container to use that memory--especially for components like Elasticsearch that run under the JVM--you'll need to adjust the JVM options. 

- Edit the `ES_JAVA_OPTS` variable. Elastic's documentation on [JVM options](https://www.elastic.co/guide/en/elasticsearch/reference/current/advanced-configuration.html) provides more details.

- By default, Elasticsearch only goes up to 31GB of memory usage unless otherwise configured (e.g., if you have a server that has 128GB and you want to use 64 [the recommendation is half of your total memory].

  -   To edit the container file, run:

      ```bash
      sudo nano /opt/lme/quadlet/lme-elasticsearch.container
      ```

  -   To add or update the following line, run:

      ```bash
      Environment=ES_JAVA_OPTS=-Xms64g -Xmx64g
      ```

  -   To reload the system daemon and restart the service, run:

      ```bash
      systemctl --user daemon-reload
      systemctl --user restart lme.service
      ```

## Elastic

### Manual Dashboard Install

You can manually import the dashboards by navigating to **‘Management’ -> ‘Stack Management’ -> ‘Saved Objects’**.

Proceed to follow the steps in the figures below. 

**Note: This step should not be required by default. Only use if the installer failed to automatically populate the expected dashboards or if you wish to make use of your own modified version of the supplied visualizations.**

Each dashboard and its visualization objects are contained within a NDJSON file (previously JSON) and can be easily imported. The NDJSON files are available in the [dashboards/](/dashboards) directory.

![Importing Objects](/docs/imgs/import.png)

![Importing Objects](/docs/imgs/import1.png)

![Importing Objects](/docs/imgs/import2.png)

<p align="center">
Steps to import objects
</p>

### Elastic Specific

Elastic maintains a comprehensive set of [troubleshooting guides](https://www.elastic.co/guide/en/elasticsearch/reference/master/troubleshooting.html) we recommend reviewing as part of your standard investigation process. If your issue appears to originate from the Elastic Stack, these resources can help. 

### Issues Installing Elastic Agent

If you have encountered the error "Elastic Agent is installed but broken" when trying to install the Elastic Agent add the following flag to your install command:

```bash
--force
```

### Changing Elastic Username Password

After installing, if you wish to change the password to the Elastic username, run: 

```bash
sudo curl -X POST "https://127.0.0.1:9200/_security/user/elastic/_password" -H "Content-Type: application/json" -d'
{
  "password" : "newpassword"
}' --cacert /opt/lme/Chapter\ 3\ Files/certs/root-ca.crt -u elastic:currentpassword
```

### Kibana Discover View Showing Wrong Index

If the Discover section of Kibana persistently displays the wrong index by default, verify that the `winlogbeat` index pattern is set as the default.

Follow the steps below to correct this issue:

- Click **Stack Management** from the left-hand menu.

![Check Default Index](/docs/imgs/stack-management.png)</p>

- Click **Index Patterns** under Kibana Stack Management.

![Check Default Index](/docs/imgs/index-patterns.png)

- Verify that the **Default label** is set next to the ```INDEX_NAME-*``` index pattern.

![Check Default Index](/docs/imgs/default-winlogbeat.png)

- If this Index pattern is not selected as the default, click on the **```INDEX_NAME-*``` pattern**, and then select the following option on the subsequent page.

![Set Default Index](/docs/imgs/default-index-pattern.png)

**Note: You will need to run this command with an account that can access `/opt/lme`. If you can't `sudo`, the user account will need access to the certifications located in the command.**

### Unhealthy Cluster Status

The cluster health may appear as yellow or red for several reasons. One common cause is unassigned replica shards. Since LME uses a single-node Elasticsearch instance by default, replicas cannot be assigned. This issue often arises from built-in indices that don't have the `index.auto_expand_replicas` setting properly configured.

This will be fixed in a future release of Elastic, but can be temporarily diagnosed and resolved as follows: 

- Check the cluster health by running the following request against Elasticsearch (an easy way to do this is to navigate to `Dev Tools` in Kibana under `Management` on the left-hand menu) by running:

  ```bash
  GET _cluster/health?filter_path=status,*_shards
  ```

- If it shows any unassigned shards, these can be enumerated by running:

  ```bash
  GET _cat/shards?v=true&h=index,shard,prirep,state,node,unassigned.reason&s=state
  ```

- If the `UNASSIGNED` shard is shown as `r` rather than `p`, this means it's a replica. In this case you can fix the error in the single-node default installation of LME by forcing all indices to have a replica count of 0 by running:

  ```bash
  PUT _settings
  {
    "index.number_of_replicas": 1
  }
  ```

- If the above solution was unable to resolve your issue, further information on this and general advice on troubleshooting an unhealthy cluster status can be found [here](https://www.elastic.co/guide/en/elasticsearch/reference/master/red-yellow-cluster-status.html).

### Fleet Server - Add Agent Shows Missing URL for Fleet Server Host

When attempting to add Elastic Agent on the host server, you may see the message **Missing URL for Fleet Server host**--as shown in the figure below.

![Check Default Index](/docs/imgs/fleetservermissingurl.png)

This typically happens when post-installation steps are run before the `lme-fleet-server` container displays a status of **Up** in `podman status`.

**Note: To avoid this, always wait until all post-installation verification steps are complete.**

If you've already run the setup prematurely, we recommend uninstalling and reinstalling LME. Alternatively, restarting the host server or simply restarting `lme-service` may resolve the issue. 

## Start/Stop LME

### Re-Indexing Errors

For errors encountered when re-indexing existing data as part of an an LME version upgrade, please review the [Elastic re-indexing documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html) for assistance.

### Illegal Argument Exception While Re-Indexing 

With the correct mapping in place, it is not possible to store a string value in any of the fields which represent IP addresses (e.g., ```source.ip```, ```destination.ip```). If you see any of these values represented in your current data as strings, (e.g.,```LOCAL```), you cannot successfully re-index with the correct mapping.

In this instance, the simplest fix is to modify your existing data to store the relevant fields as valid IP representations using the update_by_query method that is located [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update-by-query.html).

An example of this is shown below, which may need to be modified for the particular field that is causing problems:

```bash
POST winlogbeat-11.06.2021/_update_by_query
{
  "script": {
    "source": "ctx._source.source.ip = '127.0.0.1'",
    "lang": "painless"
  },
  "query": {
    "match": {
      "source.ip": "LOCAL"
    }
  }
}
```
**Note: Run this command for each index that includes problematic mappings before re-indexing can proceed.**

### TLS Certificates Expired

LME installs a self-signed certificate for HTTPS during setup. These certificates are valid for two years from the time of installation.

After expiration, LME services will stop functioning properly. To remedy this, you can either:

- Reinstall LME (which re-generates certificates without reinstalling

- Use the `lme-ca` script to manually regenerate and replace certificates without reinstalling

For more information, follow the instructions detailed [here](/docs/markdown/maintenance/certificates.md#regenerating-self-signed-certificates).

## Other Common Errors

### Windows Log with Error Code #2150859027

If you are running Windows Server 2016 or newer and encounter error code 2150859027 (or messages about HTTP URLs not being available in your Windows logs), reference this [Microsoft guide](https://support.microsoft.com/en-in/help/4494462/events-not-forwarded-if-the-collector-runs-windows-server-2019-or-2016) for resolution steps.

### Start/Stop LME

- To stop LME: 

  ```bash
    sudo systemctl stop lme.service
  ```

- To start LME:

  ```bash
  sudo systemctl restart lme.service
  ```



