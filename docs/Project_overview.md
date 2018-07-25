- [Overview](#overview)
  - [Interaction with data](#interaction-with-data)
  - [Data sources](#data-sources)
    - [Image data](#image-data)
    - [Text data](#text-data)

# Overview

The goal of the Scripta Qumranica Electronica (SQE) project is to create a platform for creating and viewing digital editions of Dead Sea Scrolls.

The project began with two large repositories of data: 

1. the multispectral images from the Israel Antiquities Authority (IAA), along with the older photos from the Palestinian Archaeological Museum (PAM).
2. the text transcriptions of the Qumran Wörterbuch Projekt (QWB), which include lexical/morphological data, variant published transcriptions, information about parallel text passages, and some bibliographical data.  

The website will serve to bring the information from these two sources together and to enable the user to edit it within the SQE database and share her or his work with a limited set of other users, or make it publically accesssible to all.  Since a multiplicity of possible interpretations in the preparation of an edition is assumed at the outset, the project has been designed in such a way as to track the source of each interpretation and to make it possible to easily review editorial variation.

## Interaction with data

The ability to manage multiple interpretations is reflected in the concept of the `scroll_version`.  Each scroll can have any number of `scroll_version`s and a user may create as many as he or she wishes.  No data is copied when a new `scroll_version` is created, rather a set of links is created between the data associated with the original scroll and the new `scroll_version` in the `X_owner` tables, the database only creates new data for a `scroll_version` when the user creates something unique (if the user makes an edit that has already been made by someone else, the system simply links to the preexisting data).  The database does not delete any data, nor does it create duplicate data, thus we can possibly provide unlimited undo and should also be able to properly track attribution of all editorial decisions.

The user interacts with the SQE project data on the level of ink and single letters.  What that means is that the connection between text and image is achieved at a very discrete level.  One letter could be linked for instance to two dots of ink on an image, and a discrete link is made between the letter and each ink mark.  These ink marks are stored as polygon regions positioned with a 2D transform matrix in the database tables `roi_shape` and `roi_position` and provide the key to comparing variant transcriptions of the same scroll.  One user may mark some ink remains as belonging to a ה in one reconstructed scroll, while another might read it as a ו in a totally different reconstructed scroll (or at another location in the same reconstructed scroll).

Reading order is also treated as an editorial decision in the SQE database.  We use a linked list (a "sign stream") in the table `position_in_stream` to store the order in which each letter of the transcriptions should be read.  Users may also create alternative possible streams in the same scroll version.

## Data sources

### Image data

The images used in the project are provided mainly by the IAA, but we can technically uses images from anywhere (we also some images from the Bibliothèque nationale de France).  The SQE project does not house any images of its own, rather it loads all images from the granting institutions via the [iiif API protocol](http://iiif.io/api/image/2.1/).  The SQE database simply stores the URL of the image and the website uses that URL to display the image to the user.  The filename for the image is stored in the table `SQE_image` under the column `filename`, and the url is accessible via a relation `image_urls_id` to the `image_urls` table and is located in the `url` column.  So, if the database returns a url `http://192.114.7.208:8182/iiif/2/` with a suffix `default.jpg` and a filename `P1-Fg001-R-C01-R01-D20102014-T102256-ML445_PSC.tif`, the image can be accessed at the address: `http://192.114.7.208:8182/iiif/2/P1-Fg001-R-C01-R01-D20102014-T102256-ML445_PSC.tif/full/pct:2/0/default.jpg`

![iiif image](http://192.114.7.208:8182/iiif/2/P1-Fg001-R-C01-R01-D20102014-T102256-ML445_PSC.tif/full/pct:2/0/default.jpg "iiif Image thumbnail from IAA")

Note that `pct:2` in the URL above accesses a very small version of the file, see [iiif API protocol](http://iiif.io/api/image/2.1/) for more details on the access options.

We never change images directly, any differences in the display of the image must be managed in-browser (we can always use a proxy on our SQE server to get around any CORS/SSL problems with the serving institution).

### Text data

The QWB project stores its transcriptions as words, but the SQE project needed to be able to work at the letter level.  For this reason the trancribed text of the QWB project has been transferred character by character into the SQE project database.  The SQE database still stores a link from each letter to its unique word id in the QWB database.  Thus, for any given letter we can still access all the lexical/morphological/bibliographic data associated with it in the QWB database (access to this has not yet been set up).  The complete database is stored in the [Scripta-Qumranica-Electronica/Data-files](https://github.com/Scripta-Qumranica-Electronica/Data-files) GitHub repository.  It has its own Docker container, which is built automatically when one bootstraps the [Scrollery-website](https://github.com/Scripta-Qumranica-Electronica/Scrollery-website) project.

Currently all the textual data in the website comes directly from the SQE database and is accessible in two ways via an API.  We have an API designed more or less for public access, and one developed specifically for the Scrollery website.  The public access API is currently being deprecated and its functionality will be subsumed into the API designed for the website.  This API is writted in Perl and currently served via Apache.  The complete low-level API is stored in the [Scripta-Qumranica-Electronica/SQE_DB_API](https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API) GitHub repository.  It has its own Docker container, which is built automatically when one bootstraps the [Scrollery-website](https://github.com/Scripta-Qumranica-Electronica/Scrollery-website) project.  The website accesses this low-level API via a higher-level CGI script `scrollery-cgi.pl` in the Scrollery-website project under `resources/cgi-bin`.  This file is a wrapper for the functionality of SQE_DB_API and provides the ability to batch AJAX requests, thus saving considerable browser resources.  

The API description for the high-level API access is available [here](./CGI-Functions.md) (documentation currently still in progress).