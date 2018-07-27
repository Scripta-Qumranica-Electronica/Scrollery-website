- [Introduction](#introduction)
  - [Creating a scroll in the SQE Database](#creating-a-scroll-in-the-sqe-database)
    - [scroll table](#scroll-table)
    - [scroll_version_group table](#scroll_version_group-table)
    - [scroll_version table](#scroll_version-table)
  - [Detailed scroll data input/output](#detailed-scroll-data-inputoutput)
    - [scroll_data table](#scroll_data-table)
    - [scroll_data_owner table](#scroll_data_owner-table)
  - [Data creation/deletion and tracking](#data-creationdeletion-and-tracking)
      - [Summary](#summary)
  - [Textual data](#textual-data)
    - [sign table](#sign-table)
    - [sign_char table](#sign_char-table)
    - [sign_char_attribute table](#sign_char_attribute-table)
    - [attribute_value table](#attribute_value-table)
    - [attribute table](#attribute-table)
    - [position_in_stream table](#position_in_stream-table)
  - [Image data](#image-data)
  - [Binding text to image](#binding-text-to-image)

# Introduction

The SQE database is a relational database containing data pertaining to text transcriptions, related image data, and other cataloging/bibliographical information.  If you do not know what a relational database is, see [here](https://mariadb.com/kb/en/library/introduction-to-relational-databases/), or [here](https://en.wikiversity.org/wiki/Introduction_to_Relational_Databases).  This tutorial assumes you know the basics of `tables`, `columns`, and `rows` in a database and the use of `primary key`s for addressing entries and `foreign key`s for linking entries.  It is also important to understand the two main types of relationships in a relational database: `one to many` and `many to many`.  An online commented schema for the database can be accessed [here](https://qumranica.org/database).

## Creating a scroll in the SQE Database

The SQE database often makes use of abstract placeholders to link data that can can changed due to editor decisions.  A primary example of this is the table `scroll`.  This table is nothing more than a single column list of `ID`s:

### scroll table

|scroll_id|
|:--:|
|1|
|2|
|3|
|4|
|5|

All data for a reconstructed scroll is ultimately linked to a `scroll_id` in the `scroll` table.

Let's start with the basics, every scroll created by a user (including all the initial scrolls created from QWB data) is treated as a `scroll_version` which is part of a `scroll_version_group`.  The `scroll_version_group` table is used to store information regarding the sharing of `scroll_version`s among users (more on that a little later).

### scroll_version_group table

|scroll_version_group_id|scroll_id|locked|
|:--:|:--:|:--:|
|1|1|1|
|2|2|1|
|3|3|1|
|4|4|1|
|5|5|1|

### scroll_version table

The actual `scroll_version`s themselves are stored in the `scroll_version` table and have a unique `scroll_version_id`:

|scroll_version_id|user_id|scroll_version_group_id|may_write|may_lock|
|:--:|:--:|:--:|:--:|:--:|
|1|1|1|0|0|
|2|1|2|0|0|
|3|1|3|0|0|
|4|1|4|0|0|
|5|1|5|0|0|

If we follow the `ID`s here we see, for instance, that the `scroll_version` with `scroll_version_id` 1 is owned by `user_id` 1 (this is the default user that imported all the data from QWB and the image processing data from Tel Aviv).  The `scroll_version_id` 1 is linked to `scroll_version_group_id` 1, which we see in the table above is linked to `scroll_id` 1.  This may seem needlessly complex, but what if I decide I want to create a copy of `scroll_version_id` 1 and edit it to my own liking?  Let's pretend I am `user_id` 2.  Since I am not creating an edition of some new, previously undiscovered scroll, but rather a new version of an existing scroll, I will link this new `scroll_version` to a new `scroll_version_group`, but that `scroll_version_group` will still link to the same old `scroll_id` 1 (I will unlonk the scroll too).

__New entry in `scroll_version_group`__

|scroll_version_group_id|scroll_id|locked|
|:--:|:--:|:--:|
|6|1|0|

__New entry in `scroll_version`__

|scroll_version_id|user_id|scroll_version_group_id|may_write|may_lock|
|:--:|:--:|:--:|:--:|:--:|
|6|2|6|1|1|

Now we know in the database that `scroll_version` 6 and `scroll_version` 1 are different version of the same scroll, since they both link to that abstract `scroll_id` 1 via an entry in `scroll_version_group`.  

Let's go just a bit further and try sharing a scroll.  My colleague, who has `user_id` 3, wants to jointly edit this new scroll, so we create a new entry in `scroll_version` and we will choose to let her write, but we won't let her lock it.

__New entry in `scroll_version`__

|scroll_version_id|user_id|scroll_version_group_id|may_write|may_lock|
|:--:|:--:|:--:|:--:|:--:|
|7|3|6|1|0|

Now any changes she makes will be owned by her in `scroll_version` 7, and any changes I make will be owned by me in `scroll_version` 6.  We know who made what edits and we can resolve differences and sync versions, since they share a common `scroll_version_group_id` (the API is not yet fully set up to provide all of this functionality yet).

## Detailed scroll data input/output

So far we have only looked at creating these abstract scrolls, version groups, and versions.  Now we want to access data in them and even insert or change data.  All data pertaining to a digital scroll is linked to a `scroll_version_id` through an "owner" table.  These "owner" tables create a many-to-many relationship between a `scroll_version` and the tables with data for the scroll  in them.

Let's start with the name of our scroll.  Among other things the *x*`_owner` tables generally contain human readable names.  So for names of scrolls we have the following:

### scroll_data table

|scroll_data_id|scroll_id|name|
|:--:|:--:|:--:|
|1|1|1QS|
|2|2|1QSa|
|3|3|1QSb|
|4|4|1QpHab|
|5|5|1QM|

We see here that one name for `scroll_id` 1 is "1QS", but how do we know that is the name associated with `user_id` 1's version of `scroll_id`?  Since the name of this table is `scroll_data`, we look it up in the `scroll_data_owner` table.

### scroll_data_owner table

|scroll_data_id|scroll_version_id|
|:--:|:--:|
|1|1|
|2|2|
|3|3|
|4|4|
|5|5|

This table tells us that the linked entry in the `scroll_data` table for `scroll_version_id` 1 is `scroll_data_id` 1.  

## Data creation/deletion and tracking

Now, remember that I created my own version of `scroll_id` 1 for `user_id` 2, and it has a `scroll_version_id` of 6.  If I want to give my version of this scroll a different name, I do so by creating two entries (this is done automatically by the SQE_DB_API):

__New entry in `scroll_data`__

|scroll_data_id|scroll_id|name|
|:--:|:--:|:--:|
|6|1|1QSerekh|

__New entry in `scroll_data_owner`__

|scroll_data_id|scroll_version_id|
|:--:|:--:|
|6|6|

My colleague (`user_id` 3 with `scroll_version_id` 7), who is sharing this scroll with me may decide to change the name too:

__New entry in `scroll_data`__

|scroll_data_id|scroll_id|name|
|:--:|:--:|:--:|
|7|1|Serekh ha-Yachad|

__New entry in `scroll_data_owner`__

|scroll_data_id|scroll_version_id|
|:--:|:--:|
|7|7|

Finally, I may decide I like her name better and I can update my version, `scroll_version_id` 6, accordingly:

__New entry in `scroll_data_owner`__

|scroll_data_id|scroll_version_id|
|:--:|:--:|
|7|6|

Notice, I did not need to create a new entry in the `scroll_data` table, I actually take my colleague's entry (`scroll_data_id` 7) and link it to my scroll version in the `scroll_data_owner` table.  I also delete the old link (`scroll_data_id` 6 `scroll_version_id` 6) from the `scroll_data_owner` table.  The entry for `scroll_data_id` 6 in the `scroll_data` table is now essentially "orphaned" in the database, but it may be linked again in the future to some other `scroll_version_id`, who knows?

#### Summary

Whenever you ask the SQE_DB_API to insert new data or to change data, it always checks to see if an entry already exists with that information.  If an entry already exists, then it links your scroll version to the preexisting data as in the example above.  No entry is changed, rather, it is copied to a new entry with the requested changes, the binding of the old entry to the `scroll_version_id` in the *x*`_owner` table is deleted, and a new entry is made in the *x*`_owner` table binding the id of the newly created entry to your `scroll_version_id`.

Also, no data entries are ever deleted from the database, rather they are simply unlinked from the current `scroll_version_id` by removing the entry in the *x*`_owner` table.  In essence each `scroll_version_id` subscribes or unsubscribes to data via these "owner" tables.

Whenever a user inserts data in the database, the transaction is recorded in the `main_action` and `single_action` tables.  These tables make it possible to see who created each individual data entry in the database, and in this way we can build up a full attribution history for every aspect of any `scroll_version` in the database.

This linking and unlinking is perhaps most easily understood by the concept of cloning a scroll.  When the SQE_DB_API clones a scroll, it simply creates a new `scroll_version_group` entry and corresponding `scroll_version` entry associated with the `user_id` of the person requesting the clone.  Then it simply looks for every entry in the "owner" tables that have a `scroll_version_id` matching the scroll to be cloned and creates a new entry for each of those, but pointing now to the newly created, or cloned, `scroll_version_id`.  Cloning a scroll does not create any new data, it just creates a set of links to data in these "owner" tables.

## Textual data

Transcribed text is organized within the database as a "sign stream" which is stored concretely in the `position_in_stream` table.  It perhaps a bit inexact to say the `position_in_stream` organizes the transcribed text, rather it organizes signs.  The `sign` table is similar to the `scroll` table in that it is simply a list of abstract `sign_id`s with no actual data of its own. 

### sign table

|sign_id|
|:--:|
|1|
|2|
|3|
|4|
|5|
|6|
|7|


These signs could be conceivably be linked to anything, but in the present system they get linked to the `sign_char` table, which provides an interpretation of the sign (the interpretation is not necessarily a character).  They also are linked to `line`s and to each other in the `position_in_stream` table.  The interpretations of these abstract `sign`s begins in the `sign_char` table:

### sign_char table

|sign_char_id|sign_id|is_variant|sign|
|:--:|:--:|:--:|:--:|
|1|1|0||
|2|2|0|ל|
|3|3|0||
|4|4|0||
|5|5|0|ש|
|6|6|0|י|
|7|7|0|ם|

As you can see, we find some entries with Hebrew letters (`sign_char_id`s 2, 5–7), but there are also entries without any letter.  These entries are not associated with any letter, but link to non-character information via the `sign_char_attribute` table:

### sign_char_attribute table

|sign_char_attribute_id|sign_char_id|attribute_value_id|sequence|
|:--:|:--:|:--:|:--:|
|1|1|10|0|
|131071|1|12|0|
|163837|1|14|0|
|1792961|1|9|0|
|167931|2|1|0|
|1738506|3|5|0|
|1937378|3|16|0|
|3772357|3|20|0|
|1407451|4|2|0|
|3772358|4|20|0|
|167932|5|1|0|
|167933|6|1|0|
|167934|7|1|0|

From this table, we can see that while `sign_id` 1 had no letter associated with it in the `sign_char` table entry with `sign_char_id` 1, it actually has four attributes associated with it (`attribute_value_id`s 10, 12, 14, and 9) via the `sign_char_attribute` table.  You will find descriptions of these attributes in the `attribute_value` table:

### attribute_value table

|attribute_value_id|attribute_id|string_value|description|
|:--:|:--:|:--:|:--:|
|1|1|LETTER||
|2|1|SPACE||
|3|1|POSSIBLE_VACAT||
|4|1|VACAT||
|5|1|DAMAGE||
|6|1|BLANK LINE||
|7|1|PARAGRAPH_MARKER||
|8|1|LACUNA||
|9|1|BREAK||
|10|2|LINE_START||
|11|2|LINE_END||
|12|2|COLUMN_START||
|13|2|COLUMN_END||
|14|2|SCROLL_START||

Now we see that `sign_id` 1 is linked to `sign_char_id` 1, and that it gets the attributes of SCROLL_START, COLUMN_START, LINE_START, and BREAK, and we see that it is marks the first line of the first column of a scroll, and that the actual beginning of this scroll is now broken.  So we are actually lacking the initial text for this scroll.

If we go one step further, we see that the `attribute` table provides us with the category of each `artefact_value`

### attribute table

|attribute_value_id|attribute_id|string_value|description|
|:--:|:--:|:--:|:--:|
|1|1|LETTER||
|2|1|SPACE||

So, we can now find letters in the database, we can also find "control" type characters marking the beginnings and ends of scrolls/columns/lines, etc.  These attributes can also convey information about letters, such as if they are reconstructed (`attribute_id` 6, `attribute_value_id` 20) or damaged and thus uncertain (`attribute_id` 5, `attribute_value_id` 19).  Users will even be able to add their own custom attributes to apply to signs.

But, how does this "bag of signs" get organized into readable text, and assigned to words/lines/columns/scrolls?  The `sign` table and the `position_in_stream` table contain all the text of every scroll in the entire database.  The `sign` table is in no particular order, any sign could conceivably followed by any other.  It is the `position_in_stream` table that provides this order in the form of a linked list.  Note that `position_in_stream` has an "owner" table, thus different `scroll_version`s can use different sign orderings.  Also, this a bit more complex than a simple linked list, since each sign can link to more than one sign thus creating branches of multiple alternate reading orders for a single `scroll_version`.

### position_in_stream table

|position_in_stream_id|sign_id|next_sign_id|
|:--:|:--:|:--:|
|1|1|2|
|2|2|3|
|3|3|4|
|4|4|5|
|5|5|6|
|6|6|7|
|7|7|8|

We could, for instance add entries to the `position_in_stream` table for an alternate branch of the reading stream:

|position_in_stream_id|sign_id|next_sign_id|
|:--:|:--:|:--:|
|8|4|6|
|9|6|5|
|10|5|7|

Now we have the two possible reading orders: 1→2→3→4→5→6→7→8; and 1→2→3→4→6→5→7→8.

The individual signs positioned in the "sign stream" are linked to words by the `position_in_stream_to_word_rel` table.  That table links to the `word` table, which maintains a connection to the word ID's in the QWB database.

These `sign`s are also linked to `line`s in a scroll via the `sign_to_line` table, `line`s are linked to `col`umns by the `col_to_line` table, and finally, `col`umns are linked to `scroll`s via the `scroll_to_col` table.  All of these tables have their own "owner" tables and related "data" tables with their `name`s.

Before we turn to the image data stored in the database, mention should be made of the `sign_char_roi`, `roi_shape`, and `roi_position` tables.  These tables link `sign`s in the database to positions in the virtual scroll, and thus create a binding between text and positioned images (see [Binding text to image](#binding-text-to-image))

## Image data



## Binding text to image