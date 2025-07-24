# Estimating Data Storage Requirements

When using LME to collect and store logs, the amount of storage required will depend on several factors, including the number of agents generating logs, the frequency of log generation, and the retention policy applied. Below are rough storage estimates based on our internal testing.

| Number of Agents | 1 Month (31 Days) | 2 Months (62 Days) | 3 Months (93 Days) |
|------------------|--------------------|---------------------|---------------------|
| 10 Agents        | 48 GB              | 97 GB               | 145 GB              |
| 20 Agents        | 97 GB              | 194 GB              | 290 GB              |
| 30 Agents        | 145 GB             | 290 GB              | 435 GB              |
| 40 Agents        | 194 GB             | 387 GB              | 580 GB              |
| 50 Agents        | 242 GB             | 484 GB              | 725 GB              |
| 60 Agents        | 290 GB             | 580 GB              | 870 GB              |
| 70 Agents        | 339 GB             | 677 GB              | 1015 GB             |
| 80 Agents        | 387 GB             | 774 GB              | 1160 GB             |
| 90 Agents        | 435 GB             | 870 GB              | 1305 GB             |
| 100 Agents       | 484 GB             | 967 GB              | 1450 GB             |
| 110 Agents       | 532 GB             | 1064 GB             | 1595 GB             |
| 120 Agents       | 580 GB             | 1160 GB             | 1740 GB             |
| 130 Agents       | 629 GB             | 1257 GB             | 1885 GB             |
| 140 Agents       | 677 GB             | 1354 GB             | 2030 GB             |
| 150 Agents       | 725 GB             | 1450 GB             | 2175 GB             |

## Important Caveat

The data presented here is based on testing conducted with a limited number of agents that were not actively being used by users. As a result, the log generation rate observed in this testing may be lower than what you might experience in real-world scenarios where machines are actively used. Machines with higher activity levels or more complex workloads may generate significantly more log data, leading to faster storage growth. In addition, Index Lifecycle Management (ILM) was not enabled. This means that the storage estimates provided here reflect raw log growth without any automated management of index lifecycle phases.

- **Enable [Index Lifecycle Management](https://cisagov.github.io/lme-docs/docs/markdown/maintenance/index-management/) (ILM):** If managing storage costs and performance is critical, consider enabling ILM in Elasticsearch. This will help automate the lifecycle of your data and reduce storage requirements over time.
- **Retention Policy:** The retention policy plays a critical role in managing storage. Use ILM to define retention policies that automatically delete older logs you no longer need.
- **Long-Term Planning/Monitoring:** Use the observed growth rates to forecast your storage needs over time and monitor your storage usage regularly to ensure your policies align with your needs.

## Final Note

These estimates are intended to provide a rough guideline based on our testing. Actual storage requirements may vary depending on the level of activity on your machines, the types of logs generated, and your specific use case. We recommend monitoring your storage usage regularly and adjusting your retention policy as needed to optimize performance and scalability.

