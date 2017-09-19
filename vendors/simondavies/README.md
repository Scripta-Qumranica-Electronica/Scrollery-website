# Simple JS Accordion
A simple vanilla javascript accordion.

## Demo
You can currently view a demo on my [Codepen page](https://codepen.io/simondavies/full/zwWmrE/)


## Installing
For now simply download the repo, to your desktop.

## Usage
Once you have download the files, move the `accordionjs.min.js`and `accordionjs.min.css` files from the `dist` folder, to the location of your choice.

At the bottom of your page, add the following code, right before your page's closing `</body>` tag

```html
<link rel="stylesheet" href="/path/to/accordionjs.min.css">
<script src="/path/to/accordionjs.min.js" charset="utf-8"></script>
```

Then to activate/call it add the following after:

```html
<script type="text/javascript">
    (function(){ new AccordionJS();})();
</script>
```

Then add the accordion html code:

```html
<!-- Accordion wrapper -->
<div id="the-accordion" class="accordion-wrapper">

    <!-- accordion panel -->
    <div class="accordion-panel">
        <div class="accordion-title"><a href="#"><!-- Panel Title Here --></a></div>
        <div class="accordion-content">
            <!-- Panel Content Here -->
        </div>
    </div>
    <!-- eo:accordion panel -->

    <!-- accordion panel -->
    <div class="accordion-panel">
        <div class="accordion-title"><a href="#"><!-- Panel Title Here --></a></div>
        <div class="accordion-content">
            <!-- Panel Content Here -->
        </div>
    </div>
    <!-- eo:accordion panel -->

</div>
<!-- eo:Accordion wrapper -->
```

Repeat the code between ```<!-- accordion panel -->```and ```<!-- eo:accordion panel -->```to add more panels, as desired.

To enable an panel as open on inital page load, add the `is-active` class name, to the required  ```<div class="accordion-panel">``` panel.

```html
<!-- accordion panel -->
<div class="accordion-panel is-active">
    <div class="accordion-title"><a href="#"><!-- Panel Title Here --></a></div>
    <div class="accordion-content">
        <!-- Panel Content Here -->
    </div>
</div>
<!-- eo:accordion panel -->
```

## To Do
As this is currently on going I have a list of to do's below:

- [x] Create an example
- [x] Create a demo
- [ ] Add my ES6 class version
- [ ] Better readme details


### License

The Simple JS Accordion is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
