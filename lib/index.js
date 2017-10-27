function isValid(arr, keys){
  keys.forEach(function(k){
    if(!arr[k]){
      return false;
    }
  });
  return true;
}
exports.WatchObject = class {
  constructor(){
    this.objects = {};
    this.triggers = {
      set: {},
      get: {},
      delete: {}
    };
  }
  obj2Hash(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 25; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  remove(object, key, type, watcherId){
    var self = this;
    if(!object._uniqueIdentifier){
      return;
    }
    if(!self.triggers[type][object._uniqueIdentifier]){
      return;
    }
    var keys = key.split("|");
    var remove = keys.length;
    for(var x=0;x<keys.length;x++) {
      if (self.triggers[type][object._uniqueIdentifier][keys[x]]) {
        if (self.triggers[type][object._uniqueIdentifier][keys[x]][watcherId]) {
          delete self.triggers[type][object._uniqueIdentifier][keys[x]][watcherId]; // remove watched conditional
          remove--;
          if(remove==0){
            return true;
          }
        }
      }
    }
    return false;
  }
  check(oTarget, sKey, newValue, type, self){
    if(!self.triggers[type][oTarget._uniqueIdentifier]){
      return;
    }
    if(!self.triggers[type][oTarget._uniqueIdentifier][sKey]){
      return;
    }
    Object.keys(self.triggers[type][oTarget._uniqueIdentifier][sKey]).forEach(function(key) {
      var tmp = self.triggers[type][oTarget._uniqueIdentifier][sKey][key];
      switch(type) {
        case "get":
          if(tmp[1](oTarget, sKey)){
            tmp[2](tmp[0], oTarget, sKey, tmp[3], tmp[4]);
          }
          break;
        case "set":
          if(tmp[1](oTarget, sKey, oTarget[sKey], newValue)){
            tmp[2](tmp[0], oTarget, sKey, oTarget[sKey], newValue, tmp[3], tmp[4]);
          }
          break;
      }
    });
  }
  proxy(object){
    var self = this;
    if(!object._uniqueIdentifier){
      var validator = {
        get: function (oTarget, sKey) {
          self.check(oTarget, sKey, null, "get", self);
          return oTarget[sKey];
        },
        set: function (oTarget, sKey, vValue) {
          self.check(oTarget, sKey, vValue, "set", self);
          return oTarget[sKey]=vValue;
        }
      };
      object._uniqueIdentifier = self.obj2Hash();
      self.objects[object._uniqueIdentifier] = new Proxy(object, validator);
    }
    return self.objects[object._uniqueIdentifier];
  }
  watcherFactory(){
    var Watcher =  class {
      constructor(watchObject){
        this.elements = {};
        this.watchObject=watchObject;
      }
      parent(parent){
        this.elements.parent = parent;
        return this;
      }
      object(object){
        this.elements.object = object;
        return this;
      }
      type(type){
        this.elements.type = type;
        return this;
      }
      key(key){
        this.elements.key = key;
        return this;
      }
      conditional(conditionalFunction){
        this.elements.conditionalFunction = conditionalFunction;
        return this;
      }
      complete(onCompleteFunction){
        this.elements.onCompleteFunction = onCompleteFunction;
        return this;
      }
      watch(){
        if(!isValid(this.elements, "parent,object,key,type,conditionalFunction,onCompleteFunction".split(","))){
          throw {};
        }
        return this.watchObject.watch(
          this.elements.parent,
          this.elements.object,
          this.elements.key,
          this.elements.type,
          this.elements.conditionalFunction,
          this.elements.onCompleteFunction
        );
      }
    };
    return new Watcher(this);
  }
  watchSetBoolean(parent, object, key, onCompleteFunction, value){
    return this.watch(parent, object, key, 'get', function(object, key, oldVal, newVal){
      return newVal==value;
    }, onCompleteFunction);
  }
  watchGet(parent, object, key, conditionalFunction, onCompleteFunction){
    return this.watch(parent, object, key, 'get', conditionalFunction, onCompleteFunction);
  }
  watchSet(parent, object, key, conditionalFunction, onCompleteFunction){
    return this.watch(parent, object, key, 'set', conditionalFunction, onCompleteFunction);
  }
  watch(parent, object, key, type, conditionalFunction, onCompleteFunction){
    var self = this;

    var proxied = self.proxy(object);

    if(!self.triggers[type][object._uniqueIdentifier]){
      self.triggers[type][object._uniqueIdentifier] = {};
    }
    var keys = key.split("|");
    var id = self.obj2Hash();
    for(var i=0;i<keys.length;i++) {
      if (!self.triggers[type][object._uniqueIdentifier][keys[i]]) {
        self.triggers[type][object._uniqueIdentifier][keys[i]] = {};
      }
      self.triggers[type][object._uniqueIdentifier][keys[i]][id]=[parent, conditionalFunction, onCompleteFunction, id, key];
    }
    return { "id": id, "proxy": proxied, "key": key, "object": object };
  }
}