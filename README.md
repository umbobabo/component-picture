# component-picture

This component provides a responsive picture element with support multiple sources.

Simply feed it a list of images, their widths, heights and dppx and it'll pick the best image to use given the width and height of the container element.

## Goals

 - [x] Provide one unified interface for adding images with multiple dppx (ala <img srcset/>)
 - [x] Provide an abstracted interface for loading multiple crops and dppx of an image (ala <picture> breakpoints)
 - [x] Decouple the notion of "media queries" from images - making a truly responsive element (not just browser-window responsive).

## Usage

[See example.es6 for how to use](./example.es6)

## Install

```
npm install --save @economist/component-picture;
```

## Run tests

```
npm test;
```
