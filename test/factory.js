var { WatchObject } = require('../lib/index.js');
var assert = require("assert");

describe("WatcherFactory", function(){
  it("should make a factory object, and trigger successfully", function(){
    var wObject = new WatchObject();
    var factoriedObject = wObject.watcherFactory();
    var object = {
      president:1,
      triggered:0
    };
    var proxiedObject = factoriedObject
      .parent(this)
      .object(object)
      .key("president")
      .type("set")
      .conditional(function(object, key, oldValue, newValue){
        return newValue==0;
      })
      .complete(function(parent, object, key, oldValue, newValue, id, keys){
        object.triggered=1
      }).watch().proxy;
    proxiedObject.president=0;
    assert.equal(1,object.triggered);
  });
  it("should use the same factory to create 2 watchers", function(){
    var wObject = new WatchObject();
    var factoriedObject = wObject.watcherFactory();
    var object = {
      president:0,
      triggered:0
    };
    var proxy = wObject.proxy(object);
    var proxyFactory = factoriedObject
      .parent(this)
      .object(object)
      .key("president")
      .type("set")
      .conditional(function(object, key, oldValue, newValue){
        return newValue==1;
      })
      .complete(function(parent, object, key, oldValue, newValue, id, keys){
        object.triggered=4
      });
    proxyFactory.watch();
    proxyFactory
      .conditional(function(object, key, oldValue, newValue){
        return newValue==2;
      })
      .complete(function(parent, object, key, oldValue, newValue, id, keys){
        object.triggered=3
      });
    proxyFactory.watch();
    proxy.president=2
    assert.equal(3,object.triggered);
    proxy.president=1
    assert.equal(4,object.triggered);
  });
  it("should constantly call set in order linearly down a file 1000 times", function(){
    var factoriedObject = ;
    var object = {
      president:0,
      triggered:0
    };
    var proxiedObject = new WatchObject()
      .watcherFactory()
      .parent(this)
      .object(object)
      .key("president")
      .type("set")
      .conditional(function(object, key, oldValue, newValue){
        return newValue==0 || newValue==1;
      })
      .complete(function(parent, object, key, oldValue, newValue, id, keys){
        object.triggered++
      }).watch().proxy;
    for(var i=0;i<1000;i++){
      proxiedObject.president=0;
      assert.equal(i*2+1,object.triggered);
      proxiedObject.president=1;
      assert.equal(i*2+2,object.triggered);
      proxiedObject.president=2;
    }
    assert.equal(2000,object.triggered);
  });
});