# WebPage

schema.org’s, unchanged.

    https://schema.org/WebPage

A web page. Every web page is implicitly assumed to be declared to be of type WebPage, so the various properties about that webpage, such as breadcrumb may be used. We recommend explicit declaration if these properties are specified, but if they are found outside of an itemscope, they will be assumed to be about the page.

*schema.org's own words, used under CC BY-SA 3.0.*

- Defined by: https://schema.org

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/webpage/1",
  "$type": "WebPage",
  "schema:name": "WebPage"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/webpage/1
$type: WebPage
schema:name: WebPage
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/webpage/1
$type: WebPage
schema:name: WebPage
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
