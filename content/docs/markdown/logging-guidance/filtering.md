---
title: Filtering Logs
---
# Filtering Logs in LME Cloud

## Overview
 
Some logs in LME Cloud can be overly verbose or not particularly useful depending on your environment (e.g., [Dashboard Spamming Events](https://github.com/cisagov/LME/issues/22)). While we aim to strike a good balance, every setup is different.

This guide shows you how to fine-tune your logging experience by applying filters in three key areas:

- Dashboard
   
- Host-level logging utilities (e.g., winlogbeat)
   
- Serverside (e.g., logstash)

We encourage you to adapt these examples to your needs and contribute improvements through pull requests.

## Dashboard Filtering Example

Here's how to apply a filter in a Kibana dashboard to hide excessive or unnecessary logs--in this case, Windows Event Log [4624](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventID=4624) from specific usernames: 

```
{
  "bool": {
    "filter": [
      {
        "match_phrase": {
          "event.code": "4624"
        }
      }
    ],
    "must_not": [
      {
        "regexp": {
          "winlog.event_data.TargetUserName": ".*$.*"
        }
      }
    ]
  }
}
```

To apply this filter:

1. Click the **`Add filter` button** in your Kibana dashboard.
   
2. Click the **`Edit as DSL` button** to paste the filter JSON.
  
3. Save the ***changes*** to your dashboard or search.

## Helpful Resources

For more advanced queries or regex help, reference these links:

 - https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html
   
 - https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
   
 - https://www.elastic.co/guide/en/elasticsearch/reference/current/regexp-syntax.html
