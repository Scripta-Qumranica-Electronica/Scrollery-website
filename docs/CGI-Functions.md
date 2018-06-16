# Contents

- [Contents](#contents)
- [Request Format](#request-format)
  - [POST Request](#post-request)
  - [JSON Payload](#json-payload)
    - [Single transaction request](#single-transaction-request)
    - [Multiple transaction request](#multiple-transaction-request)
      - [Multiple transaction in an array](#multiple-transaction-in-an-array)
      - [Multiple transaction in a set](#multiple-transaction-in-a-set)

# Request Format

## POST Request

All CGI requests are made as POST requests with a JSON payload (the content-type should be set to application/json as well, though this is usually automatic).

## JSON Payload

The CGI scripts are prepared to handle payloads in three formats, and the response will differ in correspondence to the request structure.  The JSON payload must always contain the SESSION_KEY, which is sent to the browser upon successful login with a valid username/password.

### Single transaction request

A transaction request can be as simple as a single request.

- One transaction is requested:

```JSON
{
  "SESSION_ID": "3E2NKSB8-70RF-86E8-9B05-CB47JH783D4E5",
  "transaction": "getCombs"
}
```

- A single response is returned (response format to be deprecated, see below):

```JSON
{
    "replies":
    [
        {
            "results":
            [
                {
                    "scroll_version_id":1606,
                    "user_id":5,
                    "name":"4Q163",
                    "scroll_id":98,
                    "locked":0,
                    "scroll_data_id":98
                },
                {
                    "name":"4Q163",
                    "scroll_version_id":1607,
                    "user_id":5,
                    "scroll_data_id":98,
                    "locked":0,
                    "scroll_id":98
                },
                ...
            ]
        }
    ]
}
```

**We plan soon to simplify the response for this request format to:**

```JSON

[
  {
    "scroll_version_id":1606,
    "user_id":5,
    "name":"4Q163",
    "scroll_id":98,
    "locked":0,
    "scroll_data_id":98
  },
  {
    "name":"4Q163",
    "scroll_version_id":1607,
    "user_id":5,
    "scroll_data_id":98,
    "locked":0,
    "scroll_id":98
  },
  ...
]
```

### Multiple transaction request

Often several CGI requests must be made at the same time.  Rather than firing off 50 individual POST requests at the same time, a huge performance gain can be achieved by bundling multiple individual transactions into a single POST request.  This can be done by placing the multiple transactions into an array or a labeled set.  The SESSION_ID need only be provided once at the root.

#### Multiple transaction in an array

When multiple transactions are sent as an array in a single POST request, they are processed in order and will return in the same order as they were sent (we do not multithread them).

- Request

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "requests": [
    {
      "transaction": "getImgOfComb",
      "combID": 808
    },
    {
      "transaction": "getColOfComb",
      "combID": 808,
      "scroll_version_id": 808
    }
  ]
}
```

- Response (format to be deprecated)

```JSON
{
  "replies": [
    {
      "results": [
        {
          "lvl1": "1427",
          "id": 34774,
          "side": 0,
          "lvl2": "5",
          "institution": "BNF"
        }
      ]
    },
    {
      "results": [
        {
          "col_id": 9111,
          "name": "col. 1"
        },
        {
          "col_id": 9112,
          "name": "col. 2"
        },
        {
          "name": "col. 3",
          "col_id": 9113
        },
        {
          "name": "col. 4",
          "col_id": 9114
        }
      ]
    }
  ]
}
```

**We plan soon to simplify the response for this request format to:**

```JSON
[
  [
    {
      "lvl1": "1427",
      "id": 34774,
      "side": 0,
      "lvl2": "5",
      "institution": "BNF"
    }
  ],
  [
    {
      "col_id": 9111,
      "name": "col. 1"
    },
    {
      "col_id": 9112,
      "name": "col. 2"
    },
    {
      "name": "col. 3",
      "col_id": 9113
    },
    {
      "name": "col. 4",
      "col_id": 9114
    }
  ]
]
```

#### Multiple transaction in a set

When multiple transactions are sent as a set of key-value pairs in a single POST request, the response to each transaction will have the same key as the request.  You should make sure that each key is unique.  These are currently processed serially, but we may multithread them in the future.

- Request

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "requests": {
    "1": {
      "transaction": "getImgOfComb",
      "combID": 808
    },
    "2": {
      "transaction": "getColOfComb",
      "combID": 808,
      "scroll_version_id": 808
    }
  }
}
```

- Response (format to be deprecated)

```JSON
{
  "replies": {
    "1": {
      "results": [
        {
          "lvl1": "1427",
          "id": 34774,
          "side": 0,
          "lvl2": "5",
          "institution": "BNF"
        }
      ]
    },
    "2": {
      "results": [
        {
          "col_id": 9111,
          "name": "col. 1"
        },
        {
          "col_id": 9112,
          "name": "col. 2"
        },
        {
          "name": "col. 3",
          "col_id": 9113
        },
        {
          "name": "col. 4",
          "col_id": 9114
        }
      ]
    }
  }
}
```

**We plan soon to simplify the response for this request format to:**

```JSON
{
  "1": [
    {
      "lvl1": "1427",
      "id": 34774,
      "side": 0,
      "lvl2": "5",
      "institution": "BNF"
    }
  ],
  "2": [
    {
      "col_id": 9111,
      "name": "col. 1"
    },
    {
      "col_id": 9112,
      "name": "col. 2"
    },
    {
      "name": "col. 3",
      "col_id": 9113
    },
    {
      "name": "col. 4",
      "col_id": 9114
    }
  ]
}
```

# Transaction types

## validateSession

This transaction is used to get the user_id of the user identified by a SESSION_ID.  It returns the USER_ID and SESSION_ID.

**Request**

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "transaction": "validateSession"
}
```

**Response**

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "USER_ID": 5
}
```

## getCombs

Returns a list of scroll combinations, both default SQE combinations and those belonging to the user.

**Request**

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "transaction": "getCombs",
  "USER_ID": 5
}
```

**Response**

```JSON
{
  "results": [
    {
      "scroll_id": 802,
      "locked": 1,
      "scroll_data_id": 802,
      "user_id": 1,
      "scroll_version_id": 802,
      "name": "1Q1"
    },
    {
      "scroll_data_id": 803,
      "locked": 1,
      "scroll_id": 803,
      "name": "1Q2",
      "user_id": 1,
      "scroll_version_id": 803
    }, ...
  ]
}
```

## getArtOfComb

Returns a list of ID's for all artefacts belonging to a scroll combination.

**Request**

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "transaction": "getArtOfComb",
  "combID": 808,
  "version_id": 808
}
```

**Response**

```JSON
{
  "results": [
    {
      "id": 3
    },
    {
      "id": 4
    },...
  ],
}
```

## getArtOfImage

Returns artefact data for all artefacts belonging to an image_catalog reference.

**Request**

```JSON
{
  "SESSION_ID": "369EEAB8-7078-11E8-9185-CB47E803D4E5",
  "transaction": "getArtOfImage",
  "image_catalog_id": 34774,
  "scroll_version_id": 808
}
```

**Response**

```JSON
{
  "results": [
    {
      "mask": "POLYGON((2983 3902.8,2976.5 3899.8,2970.7 3900.3,...))",
      "image_catalog_id": 34774,
      "artefact_shape_id": 3,
      "artefact_position_id": 2,
      "name": "1Q7 - 1",
      "rect": "POLYGON((2849.6 3740,3114.1 3740,3114.1 3906,2849.6 3906,2849.6 3740))",
      "side": 0,
      "transform_matrix": "{"matrix": [[1, 0, 0], [0, 1, 0]]}",
      "artefact_id": 3
    }, ...
  ]
}
```

## getImgOfComb

**Request**

```JSON
```

**Response**

```JSON
```

## getColOfComb

**Request**

```JSON
```

**Response**

```JSON
```

## getFragsOfCol

**Request**

```JSON
```

**Response**

```JSON
```

## getColOfScrollID

**Request**

```JSON
```

**Response**

```JSON
```

## getSignStreamOfColumn

**Request**

```JSON
```

**Response**

```JSON
```

## getSignStreamOfFrag

**Request**

```JSON
```

**Response**

```JSON
```

## getImagesOfFragment

**Request**

```JSON
```

**Response**

```JSON
```

## getIAAEdID

**Request**

```JSON
```

**Response**

```JSON
```

## getCanonicalCompositions

**Request**

```JSON
```

**Response**

```JSON
```

## getCanonicalID1

**Request**

```JSON
```

**Response**

```JSON
```

## getCanonicalID2

**Request**

```JSON
```

**Response**

```JSON
```

## getInstitutions

**Request**

```JSON
```

**Response**

```JSON
```

## getInstitutionPlates

**Request**

```JSON
```

**Response**

```JSON
```

## getInstitutionFragments

**Request**

```JSON
```

**Response**

```JSON
```

## imagesOfInstFragments

**Request**

```JSON
```

**Response**

```JSON
```

## getInstitutionArtefacts

**Request**

```JSON
```

**Response**

```JSON
```

## getScrollWidth

**Request**

```JSON
```

**Response**

```JSON
```

## getScrollHeight

**Request**

```JSON
```

**Response**

```JSON
```

## newArtefact

**Request**

```JSON
```

**Response**

```JSON
```

## getArtefactMask

**Request**

```JSON
```

**Response**

```JSON
```

## getScrollArtefacts

**Request**

```JSON
```

**Response**

```JSON
```

## newCombination

**Request**

```JSON
```

**Response**

```JSON
```

## copyCombination

**Request**

```JSON
```

**Response**

```JSON
```

## nameCombination

**Request**

```JSON
```

**Response**

```JSON
```

## changeArtefactPoly

**Request**

```JSON
```

**Response**

```JSON
```

## setArtPosition

**Request**

```JSON
```

**Response**

```JSON
```

## setArtRotation

**Request**

```JSON
```

**Response**

```JSON
```

## addSigns

**Request**

```JSON
```

**Response**

```JSON
```

## removeSigns

**Request**

```JSON
```

**Response**

```JSON
```

## addSignAttribute

**Request**

```JSON
```

**Response**

```JSON
```

## removeSignAttribute

**Request**

```JSON
```

**Response**

```JSON
```

## addSignCharVariant

**Request**

```JSON
```

**Response**

```JSON
```

## removeSignChar

**Request**

```JSON
```

**Response**

```JSON
```

## addSignCharCommentary

**Request**

```JSON
```

**Response**

```JSON
```

## removeSignCharCommentary

**Request**

```JSON
```

**Response**

```JSON
```

## addRoiToScroll

**Request**

```JSON
```

**Response**

```JSON
```

## removeROI

**Request**

```JSON
```

**Response**

```JSON
```

## getRoiOfCol

**Request**

```JSON
```

**Response**

```JSON
```

## getRoisOfCombination

**Request**

```JSON
```

**Response**

```JSON
```

## getTextOfFragment

**Request**

```JSON
```

**Response**

```JSON
```

## getListOfAttributes

**Request**

```JSON
```

**Response**

```JSON
```