# Estimating Data Storage Requirements

Storage needs for Logging Made Easy (LME) vary based on deployment specifics such as the number of agents, the volume and frequency of log generation, and the retention policy applied. The estimates below provide a general guideline based on internal testing and typical usage patterns.

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

The storage estimates provided above are based on internal testing with a limited number of agents that were not actively used by end users. As a result, the volume of log generation observed may be significantly lower than what would occur in real-world environments, where machines are actively in use. Systems with higher activity levels or more complex workloads may produce substantially more log data, leading to faster storage consumption.

Additionally, Index Lifecycle Management (ILM) was not enabled during testing. The figures presented here reflect raw log growth without any automated control over index aging or deletion.

To better manage storage costs and performance in production environments, consider the following considerations:

- **Enable [Index Lifecycle Management](https://cisagov.github.io/lme-docs/docs/markdown/maintenance/index-management/) (ILM)** - if managing storage costs and performance is critical, enable ILM in Elasticsearch; this automates the lifecycle of your data--such as transitioning older indices to cheaper storage tiers or deleting them--and helps reduce overall storage usage over time.
  
- **Define a Retention Policy** - your retention policy plays a critical role in controlling storage growth; use ILM to automatically delete older logs that are no longer needed, based on your organization's data retention requirements
  
- **Plan and Monitor Long-Term Usage** - use the observed log growth rate as a baseline to forecast future storage needs; regularly monitor your storage usage and adjust your ILM and retention policies to ensure they align with operational and compliance requirements

## Final Note

These estimates are intended to serve as general guidelines based on internal testing. Actual storage requirements will vary depending on factors such as machine activity levels, the types of logs generated, and your specific use case.

We recommend regularly monitoring your storage usage and adjusting your retention policies as needed to ensure optimal performance and scalability.

