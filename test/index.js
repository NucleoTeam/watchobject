var { WatchObject } = require('../lib/index.js');
var assert = require("assert"); // node.js core module

describe("WatcherWorks", function(){
  it("should trigger executeOrder626 and have a changed president field to 0", function(){
    var wObject = new WatchObject();
    function conditional(object, key, oldValue, newValue){
      return newValue==0;
    }
    function executeOrder626(parent, object, key, oldValue, newValue, id, keys){
      object[key]=newValue;
      assert.equal(0,object[key]);
    }
    var object = {
      president:1
    };
    var proxiedObject = wObject.watch(null, object, "president", "set", conditional, executeOrder626);
    proxiedObject.proxy.president=0;
  });
});