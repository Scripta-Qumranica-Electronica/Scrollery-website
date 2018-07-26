- [Overview of Scrollery website Menu system](#overview-of-scrollery-website-menu-system)
    - [Introduction](#introduction)
    - [Child menus](#child-menus)
        - [Combination menus](#combination-menus)
        - [Column Menus](#column-menus)
        - [Image menus](#image-menus)
        - [Artefact Menus](#artefact-menus)

# Overview of Scrollery website Menu system

## Introduction

The components for the menu system in the Scrollery website are located in `src/js/components/menu`.  The parent component `MainMenu.vue`is loaded and positioned by `src/components/AppBody.vue`.  The `MainMenu.vue` component receives the `corpus`object (see `src/js/models/Corpus.js`) from `ÀppBody.vue`and this is the same instance of the object passed to every component in the site (in essence it is a singleton, though not actually).  The `corpus`object has all the data used by the various components of the site and contains all the logic for requesting and syncing data with the SQE server.  `MainMenu.vue` passes this object to all of its children.

Clicking on any element in the menu will set the website router to the appropriate address, all other components react in accordance with that address change.  The menu does not and should not directly interact with any components other than its children (note: the AddNewDialog is also a child of it).

## Child menus

`MainMenu.vue` displays a large number of child menu items called "combinations"—these are `scroll_version`s in the database.  It finds the data for these in `corpus.combinations`, which is a key-value store.  Since `ÀppBody.vue` already takes care of loading the combinations from the server with `this.corpus.combinations.populate()`, the corpus object is already filled with all the `scroll_version`s belonging to the user and to the default data set.  `MainMenu.vue` uses the `corpus.combinations.keys()` function to get a list of all keys in `corpus.combinations` and then uses those keys to create individual instances of the `CombinationMenuItem.vue` component for each with the relevant data.  `MainMenu.vue` also uses an input box to allow the user to type in all or part of the name of a `scroll_version`, it then hides any CombinationMenuItems with a title that does not match the search string. 

### Combination menus

The combination menu component, `src/js/components/menu/CombinationMenuItem.vue`, corresponds to a single `scroll_version` in the database.  This is basically a reconstructed scroll, which is the largest texual element in the database.  A combination is made up of columns of text, each of which has lines, words, and signs, and of images, each of which has a polygonal artefact (i.e., the polygonal region of the rectangular image that is ocupied by the scroll fragment itself).  Thus, the combination menu item has two sets of children: `ColumnMenuItem.vue` components for all the columns in the scroll; and `ImageMenuItem.vue` components for all the images of fraqments that are part of the scroll.

When a combination is selected, it must ask to corpus object to provide these lists of columns and of images.  This is done with the following two commands:

```Javascript
this.corpus.cols.populate(
    {
        scroll_version_id: this.combination.scroll_version_id,
        scroll_id: this.combination.scroll_id,
    }
)
```

and 

```Javascript
this.corpus.imageReferences.populate(
    {
        scroll_version_id: this.combination.scroll_version_id,
        scroll_id: this.combination.scroll_id,
    }
)
```

Since the corpus object is reactive, the arrays `combination.cols` and `combination.imageReferences`, which were empty before asking the corpus object to fetch them from the server, are now populated with the relevent keys and will now show the newly loaded data in `corpus.cols` and `corpus.imageReferences` (Reminder: the data in the corpus object is largely noormalized, so data is linked by unique ID's, not as child nodes on a deeply nested tree).

The `CombinationMenuItem.vue` component also provides the ability to rename the combination, to clone it to a new scroll_version, to delete it, and we will soon add the option to lock/unlock the combination (only if you own it).  It also gives the opportunity to add a new column or new artefact to the scroll.  Selecting these options brings up the `src/js/components/AddNewDialog/AddNewDialogMenu.vue` which is an interface that helps the user easily find and insert the desired column or artefact.

### Column Menus

The column menu component, `src/js/components/menu/ColumnMenuItem.vue`, corresponds to a `col` in the database.  It has a human readable name and links to all lines, words, and signs that are a part of it.  This component has no children of its own, but provides the functionality to rename the column and to delete it from the current scroll_version.  *In the future we should perhaps add the possibilty to reorder the columns via drag and drop.*

A name change is accomplished by a request to the corpus object:

```Javascript
this.corpus.cols.updateName(
    this.column.col_id, 
    this.nameInput, 
    this.scrollVersionID
)
```

Deleting a column is accomplished similarly:

```Javascript
this.corpus.artefacts.removeItem(
    this.artefact.artefact_id, 
    this.scrollVersionID
)
```

The vue components will always automatically update when either request finishes.

### Image menus

The image menu component, `src/js/components/menu/ImageMenuItem.vue`, corresponds to a `image_catalog` entry in the database.  These are __institutional references__ to the object, usually a plate and fragment.  There may be many different images of a particular plate/fragment (color, grayscale, multispectral, raking lights, etc.), all of these individual images are linked to the image reference in the `image_catalog` table of the database.  Since the labels for the image references are set by the institution, they are not able to be changed by the user.  The image references are not really part of a virtual scroll, they are only connected to a virtual scroll in two ways:

1.  The imaging institution has provided cataloguing information telling us that a particular image reference belongs to a given scroll (see the `edition_catalog` table in the database).
2.  Each artefact, which does properly belong to a scroll_version, maintains a link to its corresponding image reference in the `image_catalog` table via an entry in the `SQE_image` table.  Thus image references related to a scroll can also be found via the artefact.

An image reference has one or more actual images, as noted above, it also can have one or more artefacts (a polygonal area in the image occupied by a scroll fragment) and one or more ROI's—the ROI's are technically contained within the artefact and are marks of ink or other regions of the artefact that are of interest to the editor (these could possibly include stress marks and wormholes, etc.).

The `ImageMenuItem.vue`component will display a green circle with a check mark if images for that reference are currently available, and a red circle with an x if they are not.  *It might be nice to display a thumbnail and some metadata on hover (we should probably add this feature).  It might also be nice to note somehow whether the image reference has any children artefacts available or not.*

The `ImageMenuItem.vue`component will load any child artefacts when clicked.  These are requested from the server in the standard way:

```Javascript
this.corpus.artefacts.populate(
    {
        image_catalog_id: this.image.image_catalog_id,
        scroll_version_id: this.scrollVersionID,
    }
)
```

When that server request finishes, `image.artefacts` will now have an array of keys corresponding to the keys in `corpus.artefacts`, which are used to create the `ArtefactMenuItem.vue` components.

### Artefact Menus

The artefact menu component, `src/js/components/menu/ArtefactMenuItem.vue`, corresponds to an `artefact` in the database.  It has a human readable name, which the user may change.  It does have ROI's as child components, but it does not make sense to display those in the menu (there may be hundreds of ROI's in one artefact).  The `ArtefactMenuItem.vue` component also offers the functionality to delete an artefact from the current scroll.

A name change is accomplished by a request to the corpus object:

```Javascript
this.corpus.artefacts.updateName(
    this.artefact.artefact_id, 
    this.nameInput, 
    this.scrollVersionID
)
```

Deleting an artefact is accomplished similarly:
```Javascript
this.corpus.artefacts.removeItem(
    this.artefact.artefact_id, 
    this.scrollVersionID
)
```

The vue components will always automatically update when either request finishes.