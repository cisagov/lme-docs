---
title: Encryption At Rest
---
# Encryption At Rest

To protect data by Elastic Cloud Enterprise, encryption at rest must be configured with disk-level encryption (e.g., `dm-crypt`). Elastic Cloud Enterprise does not support encryption at rest out of the box. Instead, disk-level encryption (e.g., `dm-crypt`) must be manually configured on underlying hosts. 

## X-Pack Option for Encryption

Since native encryption at rest is not included, Elastic offers a paid solution through its X-Pack extension. X-Pack enables encryption beyond the disk layer and includes several other advanced security features. 

Key benefits of X-Pack encryption:

- Encrypts data natively within Elasticsearch
- Provides secure, compliant protection for sensitive data
- Integrates with the broader X-Pack security feature set

**Note: X-pack includes a 30-day free trial. After the trial ends, a Platinum license may be required to retain full functionality.** 

## Resources

- [Elastic Security Considerations - Encryption](https://www.elastic.co/guide/en/cloud-enterprise/current/ece-securing-considerations.html#:~:text=To%20ensure%20encryption%20at%20rest,encrypted%20at%20rest%20as%20well)

- [Deep Dive Into X-Pack Elasticsearch: Advanced Features and Implementation](https://opster.com/guides/elasticsearch/security/x-pack/#:~:text=X%2DPack%20is%20an%20Elastic,features%20you%20want%20to%20use)
