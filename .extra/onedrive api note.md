[OneDrive API Doc](https://docs.microsoft.com/en-us/onedrive/developer/?view=odsp-graph-online)

```
Doc Structure
  ├─ OneDrive
  │  what is OneDrive API and What can we do base it.
  │
  └─ REST APIs/
    ├─ REST APIs
    │  drive vs driveItem, propeties&facets&references
    │  tailor the response by optional query parameters
    │  the request URL's format: <base>/<user|group|site>/<drives/drive-id|drive>/<item-id|item-path|special-syntax>/<more>
    │  Shared folders and remote items
    │  Webhooks (relative async ?), requset limits
    │
    ├─ Getting started/
    │ ├─ Getting started
    │ │  get token by completing authentication and authorization,
    │ │  and use it to request by adding header (Authorization: bearer {token})
    │ │
    │ ├─ App registration
    │ │  register your app in Azure Portal to get the APPID used in next requests
    │ │
    │ ├─ Authentication/
    │ │  ├─ Authentication
    │ │  │  Two way to auth, by Microsoft Graph, or by Azure Active Directory (AAD)
    │ │  │  The former for OneDrive and SharePoint online,
    │ │  │  but the latter for SharePoint Server 2016
    │ │  │  (So we don't need to read the doc of AAD auth)
    │ │  │
    │ │  ├─ Microsoft Graph
    │ │  │  token flow vs code flow, and the parameters & response you should know
    │ │  │  Sign the user out optionally
    │ │  │
    │ │  └─ Azure Active Directory
    │ │     not need to read
    │ │
    │ └─ RElease notes
    │    Differences between OneDrive Personal, OneDrive Business SharePoint
    │
    ├─ Concepts/
    │ ├─ Concepts
    │ │  List some base concepts about this section
    │ │
    │ ├─ Addressing items
    │ │  ID-based and Path-based addressing, path encoding (very important)
    │ │  the illegal chars in the name of file/folder
    │ │
    │ ├─ App folder
    │ │  [TODO ...]
    │ │
    │ ├─ Custom metadata
    │ │  [TODO ...]
    │ │
    │ ├─ Error responses
    │ │  [TODO ...]
    │ │
    │ ├─ Filter
    │ │  [TODO ...]
    │ │
    │ ├─ Long running actions
    │ │  [TODO ...]
    │ │
    │ ├─ Migrate from LiveSDK
    │ │  Not need to read, because we have never used LiveSDK
    │ │
    │ ├─ OneDrive endpoint
    │ │  Although the Microsoft Graph is the preferred OneDrive endpoint,
    │ │  it may be necessary to use direct API endpoint without using the
    │ │  Microsoft Graph in some enterprise scenarios.
    │ │
    │ ├─ Query string parameters
    │ │  [TODO ...]
    │ │
    │ ├─ Scanning guidance
    │ │  [TODO ...]
    │ │
    │ ├─ Uploading files
    │ │  [TODO ...]
    │ │
    │ ├─ Using sharing links
    │ │  [TODO ...]
    │ │
    │ └─ Working with CORS
    │    [TODO ...]
    │
    ├─ Drives/
    │  [TODO ...]
    │
    ├─ DriveItems/
    │  [TODO ...]
    │
    ├─ Permissions/
    │  [TODO ...]
    │
    ├─ Activites/
    │  Not need to read, because this feature is only available for business.
    │
    ├─ Sites/
    ├─ Lists/
    ├─ ListItems/
    │  Not need to read these docs, because these 
    │  features is available for SharePoint not OneDrive.
    │
    ├─ Webhooks/
    │  [TODO ...]
    │
    └─ Resources/
       Contains details of most of the concepts introduced above.
       So when you meet some problems, you might look for this section.
```