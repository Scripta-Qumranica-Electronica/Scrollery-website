# Scrollery-website
This is a develpoment space for the SQE website.  It is currently in its earliest stages of development, but we hope that hosting it here will streamline the process of development.

## Structure
The website is currently under heavy development, but a few words are in order about design principles that will aid in the growth of the project.  We aim to make the site as modular as possible so that layout and functionality can be more easily updated and debugged.  HTML code is generally reserved for defining static structures, i.e., the basic organization of the DOM and fixed layout components.  CSS code is used to provide consistent formatting and to control layout constraints.  Dynamic alteration of page layout should be accomplished through CSS whenever possible, and only fall back to javascript when necessary.  Dynamic loading of content and all event handling (apart from those events triggered directly via CSS) should be dealt with in Javascript.  Javascript will also be used for many event driven CSS changes.  

At this stage we prefer small and narrowly targeted javascript files to large multipurpose ones.  These files will likely be combined and minified (or otherwise compressed) when the site moves into production.  The website currently utilizes JQuery, and developers are strongly encouraged to make use of the library, especially when working with browser specific javascript function, such as the creation and removal of event listeners and AJAX requests, among other conveniences for the sake of compatability.

This website will make intensive use of graphics capabilities, and at this point we do not aim to support severly outdated browsers.  Our current compatability target is IE 10 or higher, which should also cover most relatively up to date versions of Firefox, Chrome (desktop and Android), and Safari (desktop and iOS).  We do utilize both HTML5 and CSS3 routines, but would like to avoid heavy usage of browser prefixes in CSS.

As it presently stands, the website is divided into 2 main sections within the "site" div:
1. A main side menu bar in the "main-menu" div
1. A div container "editing panes" which houses the various specialized editing panes

The "editing panes" div currently contains three elements:
1. A div "single-image-container" for working with set of images corresponding to a fragment as defined by the institution that provides the images (the IAA)
1. A div "signs-container" for working with text and the definition of signs marked in the images of the "single-image-container"
1. A div "combination-container" in which multiple fragment artefacts and text reconstructions can be visually arranged

Other specialized types of editors may be devised in the course of the project, and they should likely be designed with this modular type of format in mind.

## Setting up a development environment
Most development on this repository will require a local LAMP/MAMP/WAMP setup.  The SQE website is currently hosted on an Apache server and makese heavy use of Perl CGI scripts to transport data to and from our MariaDB database.  I assume that those who will want to assist in development already have or know how to set up the relevant Apache + Perl CGI server and a MariaDB server on their local host.

Developers must configure their Apache server settings to enable the running of perl CGI scripts in the resources/cgi-bin of their local instance of this repository.  Access to the SQE database should be accomplished through the API hosted at https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API.  The files from the project should be placed in /home/perl_libs.  Make sure to add a SQE_RESTRICTED.pm file there as well in accordance with the documentation in the project's README.md.  All Perl CGI files that access the database should acquire their DBH via the method get_dbh in that API.

The latest database dump from our SQE database is hosted in the GitHub repository https://github.com/Scripta-Qumranica-Electronica/Data-files with the name SQE_A.sql.  This file must be imported into the local MariaDB instance.
