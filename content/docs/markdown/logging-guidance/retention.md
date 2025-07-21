---
title: Deprecated - Retention Settings
---
**Note**: This page is no longer maintained. For information on LME index lifecycle management and managing retention settings, navigate to [LME Index Management](https://cisagov.github.io/lme-docs/docs/markdown/maintenance/index-management/)


# Retention Settings

By default, Logging Made Easy (LME) configures an index lifecycle policy that deletes indices based on estimated disk usage. Initially, 80% of the disk space is allocated for the indices, assuming that one day of logs uses approximately 1 GB of space.

If you wish to adjust the number of days logs are retained, follow the steps below using the `lme_ilm_policy` under Index Lifecycle Policies.

## Adjusting the Retention Period

**Step 1: Access Index Lifecycle Policies**

- Log in to **Kibana**.
  
- Navigate to: **Stack Management -> Index Lifecycle Policies**.
  
- Locate the policy named **`lme_ilm_policy`**.

- Click on the ***policy name*** to open its settings.

![Retention settings](/docs/imgs/retention_pics/retention_1.png)

**Step 2: Edit the Delete Phase**

- Scroll down to the **Delete phase section**.

- Under the Move data into phase after section, set the ***number of days*** you'd like logs to be retained (e.g., 180 days).

- Optionally, you can set a ***snapshot policy*** by typing the ***name of an existing snapshot policy***.

- Optionally, add a ***policy name*** for reference.

  This ensures a snapshot is taken before data is deleted.

![Retention delete phase settings](/docs/imgs/extra_beats_pics/update-retention.png)

**Step 3: Save the Policy**

- Click the **Save policy button** at the bottom of the page.

- Your new retention settings will immediately apply to all indices using the `lme_ilm_policy`.

**Important: Ensure that the new policy does not result in unwanted data loss by reducing the retention period, which would cause existing logs to be deleted.**

## Important Notes

- Users must ensure that the retention period is appropriate for the disk space available.

- If disk space is exhausted, then the solution will experience performance issues and new logs will not be recorded. By default, Elasticsearch will not allocate shards to any nodes that are using 85% or more of the available disk space. Reference the [Elasticsearch
Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/disk-allocator.html) (the `cluster.routing.allocation.disk.watermark.low` setting in particular) for more information.


