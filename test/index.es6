import React from 'react';
import Picture from '..';
import * as dppxUtils from '../get-dppx';
import * as resizeUtils from '../element-resize-listener';
import * as reactDom from 'react-dom';
import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();
/* eslint react/no-danger: 0, id-match: 0 */
describe('Picture', () => {
  let picture = null;
  it('is compatible with React.Component', () => {
    Picture.should.be.a('function')
      .and.respondTo('render');
  });

  it('renders a React element', () => {
    React.isValidElement(<Picture alt="foo" sources={[]}/>).should.equal(true);
  });

  describe('initial state', () => {
    beforeEach(() => {
      dppxUtils.getClosestDppx = chai.spy(() => 1);
    });

    it('sets state.{dppx,url,width,height} to first image that matches closest dppx', () => {
      picture = new Picture({
        alt: 'foo',
        sources: [
          { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
          { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
        ],
      });
      picture.state.should.deep.equal({
        url: 'https://placehold.it/896x504',
        width: 896,
        height: 504,
        dppx: 1,
      });
      dppxUtils.getClosestDppx = chai.spy(() => 2);
      picture = new Picture({
        alt: 'foo',
        sources: [
          { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
          { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
        ],
      });
      picture.state.should.deep.equal({
        url: 'https://placehold.it/1792x1008',
        width: 896,
        height: 504,
        dppx: 2,
      });
    });
  });

  describe('componentDidMount', () => {
    let reactDomRef = null;
    beforeEach(() => {
      picture = new Picture({
        sources: [],
        alt: 'foo',
      });
      picture.refs = { picture: {} };
      reactDomRef = {};
      reactDom.findDOMNode = reactDom.default.findDOMNode = chai.spy(() => reactDomRef);
      resizeUtils.addElementResizeListener = chai.spy();
      resizeUtils.removeElementResizeListener = chai.spy();
    });

    it('calls addElementResizeListener(findDOMNode(this), this.changeImageByWidth)', () => {
      picture.componentDidMount();
      reactDom.findDOMNode
        .should.have.been.called(1)
        .with.exactly(picture);
      resizeUtils.addElementResizeListener
        .should.have.been.called(1)
        .with.exactly(reactDomRef, picture.changeImageByWidth);
    });
  });

  describe('componentWillUnmount', () => {
    let reactDomRef = null;
    beforeEach(() => {
      picture = new Picture({
        sources: [],
        alt: 'foo',
      });
      picture.refs = { picture: {} };
      reactDomRef = {};
      reactDom.findDOMNode = reactDom.default.findDOMNode = chai.spy(() => reactDomRef);
      resizeUtils.addElementResizeListener = chai.spy();
      resizeUtils.removeElementResizeListener = chai.spy();
    });

    it('calls removeElementResizeListener(findDOMNode(this), this.changeImageByWidth)', () => {
      picture.componentWillUnmount();
      reactDom.findDOMNode
        .should.have.been.called(1)
        .with.exactly(picture);
      resizeUtils.removeElementResizeListener
        .should.have.been.called(1)
        .with.exactly(reactDomRef, picture.changeImageByWidth);
    });
  });

  describe('changeImageByWidth', () => {
    beforeEach(() => {
      picture = new Picture({
        sources: [
          { url: 'https://placehold.it/1792x1008', width: 896, height: 504, dppx: 2 },
          { url: 'https://placehold.it/896x504', width: 896, height: 504, dppx: 1 },
          { url: 'https://placehold.it/1536x864', width: 768, height: 432, dppx: 2 },
          { url: 'https://placehold.it/768x432', width: 768, height: 432, dppx: 1 },
          { url: 'https://placehold.it/1280x720', width: 640, height: 360, dppx: 2 },
          { url: 'https://placehold.it/640x470', width: 640, height: 360, dppx: 1 },
        ],
        alt: 'foo',
      });
      picture.setState = (state) => (picture.state = { ...picture.state, ...state });
    });

    it('sets state.url to the closest image to the given (width, height)', () => {
      picture.state.dppx = 1;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/896x504', 'closest to 2000x2000');
      picture.changeImageByWidth(890, 500);
      picture.state.url.should.equal('https://placehold.it/896x504', 'closest to 890x500');
      picture.changeImageByWidth(770, 450);
      picture.state.url.should.equal('https://placehold.it/768x432', 'closest to 770x450');
    });

    it('only picks images with appropriate dppx', () => {
      picture.state.dppx = 2;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/1792x1008', 'closest to 2000x2000-dppx2');
      picture.state.dppx = 1;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/896x504', 'closest to 2000x2000-dppx1');
      picture.state.dppx = 3;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/1792x1008', 'closest to 2000x2000-dppx3');
      picture.state.dppx = 0.5;
      picture.changeImageByWidth(2000, 2000);
      picture.state.url.should.equal('https://placehold.it/896x504', 'closest to 2000x2000-dppx0.5');
    });

  });

  describe('Rendering', () => {
    it('renders a div.pictrue with an <img> tag, with src from state.url', () => {
      picture = new Picture({ sources: [], alt: 'foo' });
      picture.state.url = 'http://foo/bar';
      picture.render().should.deep.equal(
        <div className="picture">
          <img src="http://foo/bar" alt="foo"/>
        </div>
      );
    });

    it('renders <img> alt from props.alt', () => {
      picture = new Picture({ sources: [], alt: 'this' });
      picture.state.url = 'http://some-image';
      picture.state.alt = 'never this';
      picture.render().should.deep.equal(
        <div className="picture">
          <img src="http://some-image" alt="this"/>
        </div>
      );
    });

    it('renders div className based on props.className', () => {
      picture = new Picture({ sources: [], alt: 'this', className: 'foo bar' });
      picture.state.url = 'http://some-image';
      picture.render().should.deep.equal(
        <div className="picture foo bar">
          <img src="http://some-image" alt="this"/>
        </div>
      );
    });

    it('renders div className based on props.className array', () => {
      picture = new Picture({ sources: [], alt: 'this', className: [ 'baz', 'bing' ] });
      picture.state.url = 'http://some-image';
      picture.render().should.deep.equal(
        <div className="picture baz bing">
          <img src="http://some-image" alt="this"/>
        </div>
      );
    });

    it('can be given arbitrary props to render', () => {
      picture = new Picture({ sources: [], alt: 'this', itemProp: 'blarg' });
      picture.state.url = 'http://some-image';
      picture.render().should.deep.equal(
        <div className="picture" itemProp="blarg">
          <img src="http://some-image" alt="this"/>
        </div>
      );
    });
  });

});
