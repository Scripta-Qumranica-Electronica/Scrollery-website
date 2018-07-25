- [Scrollery-website Overview for developers](#scrollery-website-overview-for-developers)
    - [Dependencies](#dependencies)
  - [Introduction](#introduction)
  - [Design structure](#design-structure)
  - [Design principles](#design-principles)
    - [Templating and user interaction](#templating-and-user-interaction)
    - [Data models](#data-models)

# Scrollery-website Overview for developers

### Dependencies

The [scrollery-website](https://github.com/Scripta-Qumranica-Electronica/Scrollery-website) project is dependent on the [SQE_DB_API](https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API) and the [SQE database](https://github.com/Scripta-Qumranica-Electronica/Data-files).  These are automatically downloaded and installed by the `yarn run bootstrap` install script.

## Introduction
The Scrollery-website provides a front end for access to the data stored in the SQE database and the relevant images served mainly by the IAA. It accesses the images using the [iiif Image API](http://iiif.io/api/image/2.1/), and the SQE Database via `resources/cgi-bin/scrollery-cgi.pl`, which is a wrapper for the low level [SQE_DB_API](https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API).

It is built using the Vue.js framework, but efforts have been made to minimize dependence on that framework.  Thus a number of utilities, data models, and controllers are written in plain javascript to facilitate greater portability of the code.

Vue router is used to set the current object of interest.  This may be completely unset, or a user might select a scroll, or a scroll and a column of text, or even a scroll, a column of text, an image, and an artefact.  The router is set via the menu on the left hand side of the screen, all other components of the website have watchers that react to changes in the router.  There is no need to write special code in a created/mounted lifecycle hook, since the website automatically triggers a router reset upon initial load.  This means users can navigate to or share a specific router address that loads up a particular state of the website.

Vuex is used minimally to store stateful data.  Most importantly it stores a session id, which corresponds to a session id in the server database, this session id can be persisted in the browser storage if the user allows this.  Thus, if one has a valid session id, it is not necessary to login again.  The session id is used to authenticate all user transactions with the server (the user id and password are only ever transmitted for initial authentication and the password is never stored enywhere).

## Design structure

The website consists of four main sections: a header, a hiding menu, a panel for working with images, and a panel for working with text.  A fifth panel is currently hidden, it is a wide panel made for working with a graphical reconstruction of the full scroll.  It can display cut outs of the scroll fragments and allows you to drag them around.  In the end, this may very well become the main display with many controlls for establishing columns, groups of fragments, linking text transcription to regions on the images, and even text editing.  There are currently two situations wher one experiences pop-up dialogues (adding a new column/artefact and editing text attributes).  We currently prefer to keep pop-up dialogues to a minimum.  We also make the components dynamic in nature, so certain functionality appears or disappears based on the router and other factors (like a scroll being locked).

Code for the Header and Image pane is located in `/src/js/components`, the Menus are located in `/src/js/components/menu`, the editor pane is in `/src/js/components/editor`, and the dialog for adding new artefacts and columns to a scroll is in `/src/js/components/AddNewDialog`.

The website should eventually be multilingual.  The controller for this is in `/src/js/plugins/i18n.js`.  This creates a service $i18n that can be accessed in any Vue component, and uses the dictionaries in `/src/js/lang`.  It can be used like `$i18n.str('Logout')` or `$i18n.str('User.LoggedInMessage', {name: username})` to perform a lookup and display the proper information.

AJAX post requests can be made simply with `$post()` using the standard variables for an axios post request.  The file `/src/js/plugins/ajax.js` captures every request and inserts the current session id, it also passes back the request into the response, which is helpful for debugging among other things.

There are a number of useful modules in `/srv/js/utils`.  Several of these are for working with images and vector data; `Potrace.js` is a raster to vector convertor based on Peter Sellinger's well known algorithm, it is used to create vector paths for new/edited artefacts, `VectorFactory.js` converts vectors of all sorts to other formats and provides functionality to draw a vector to a canvas.  Others, like `DOMSelection.js` and `StringDiff.js` are for working with text editing.  `Queue.js` and `QueueAction.js` are part a of a queuing system for changes to text (I don't they are currently used).

Unit tests are stored in the `tests` folder.  Basically anything in there ending in `-test.js` will be picked for unit testing by `yarn run test:travis` and TravisCI when make PR's to master.  We have server tests also, which test the functionality of the SQE_DB_API and database (it uses the Docker Containers), these are in `tests/server` and anything ending in `-test.js` will be automatically picked up for testing.  These can be run with `yarn run test:server` and they are also run automatically by TravisCI with any PR to master.

## Design principles

The website is built in a modular fashion.  It is best to create reusable components whenever possible.  We prefer to use well written and commonly used open source libraries/packages whenever possible (they must be opensourced).  We try to avoid premature optimization, especially as we are in the developmental stage of the project.

The website has two main aspects to it: the templating and user interaction, which is managed by the Vue.js components; and the browser-side data models, which interact with the serverside database.

### Templating and user interaction

The Vue.js components are in charge of accessing the required data and formatting it for display in the browser.  They also manage user input.  They should, however, only interact with the browser side data models.  If new data is requested, perhaps an image of a scroll fragment or the text of a column, the Vue component should request this from the browser-side data model or its controller; the component should not make AJAX calls of its own to the server-side API for data.  The data models and their controllers have the necessary logic to request data from the server and to populate themselves with it.  Likewise, any user input that the Vue component receives should be passed to the data models or their controllers, they will then take care of syncing changes with the server and updating themselves.

The data models are properly reactive, the Vue component need simply reference them in the template, and the template will automatically update whenever the data model changes.

### Data models

As just noted, the data models are responsible for collecting data from the server and for syncing changes with the server.

There are currently two different data models in the project, each designed by a different developer for different parts of the website.  We would like to eventually bring these in line with each other and merge them.

`src/js/models/Corpus.js` contains all the data for the menu system, the images, the artefacts, and the ROI's.  It is a self-contained model containing its own controller.  This large Object is composed of several lists, and the data in them is mostly normalized.  The corpus object has a lists of combinations (i.e., reconstructed scrolls), columns, images, artefacts, and ROI's.  The data in these lists are linked to each other by unique id.  Data can by requested by accessing the relevant list and making a request, for instance to fill the data model with all columns in a scroll, one simply calls: 

```Javascript
this.corpus.cols.populate({
  scroll_version_id: 808, //desired scroll_version_id
  scroll_id: 808, //desired scroll_id
})
```

The `corpus` model will take care of polling the server and populating itself with all the relevant data.  This is done using Object.assign and thus any template bindings to the data will update automatically.  Likewise, if you want to change the name of an artefact, you simply ask the model to do it:

```Javascript
this.corpus.artefacts.updateName(
  this.artefact.artefact_id, // The id of the artefact
  this.nameInput, // The new name
  this.scrollVersionID // The scroll_version_id
)
```

The model updates itself immediately, then asks the server to accept the change, and after getting a response back either keeps the new name on a successful write, or reverts to the original if the write to the database failed.

The functions provided by the corpus model return promises, so the Vue component can also react to responses from the database.  This is most commonly used to increment the "busy" indicator in the Vuex store before making a request `this.$store.commit('addWorking')` and to decrement it when the request finishes `this.$store.commit('delWorking')`.  This is also useful when you need to access data in a particular order, like getting some ImageReferences and then after that getting the Images corresponding to those ImageReferences.

`src/js/models/Composition.js` contains all the data for the text of a scroll or scroll column.  It works in conjunction with `src/js/controllers/column-persistance-service.js` as the controller in charge of syncing it with the server database.  It is a deeply nested data model and I do not fully understand how it all works yet.  __You can help with the documentation by adding to this section.__