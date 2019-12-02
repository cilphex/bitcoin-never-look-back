# Bitcoin's Never Look Back Price

This is a simple little page to track Bitcoin's "Never Look Back" price, as
described in [this Medium article](https://medium.com/@cane.island/why-bitcoin-is-never-looking-back-f06ab333742e).

Publicly viewable at [bitcoin.craighammell.com](http://bitcoin.craighammell.com).

### Current Limitations

- The data must be manually updated, so is not always fresh.

### Todo

- 2 scales on chart #2 may be able to be merged if you plot `10^exponent` instead of just `exponent` as the regression line
- Figure out what's going on with `constants.js` - not needed?
- Variable renaming - inconsistencies w/ "nlb" & "forward minimum"
- Add 2nd page for the [power law corridor](https://medium.com/coinmonks/bitcoins-natural-long-term-power-law-corridor-of-growth-649d0e9b3c94)

### Tech Choices

This project is an experiment in using vanilla, *browser-side* Javascript
modules. Avoiding transpiling is a goal, nice as React and Mobx are.

It may not work in some browsers.

### Deployment

This code is deployed to bitcoin.craighammell.com using
[Cloud Build](https://cloud.google.com/community/tutorials/automated-publishing-cloud-build).
