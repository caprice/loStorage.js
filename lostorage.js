// Copyright (c) 2012 Florian H., https://github.com/js-coder https://github.com/js-coder/lostorage.js

!function (window, undefined) {
   
   var utils = {
      
      isArray: Array.isArray || function (value) { // Checks if `value` is an array created with `[]` or `new Array`.
         return Object.prototype.toString.call(value) === '[object Array]';
      },
         
      isPlainObj: function (value) { // Checks if `value` is an object that was created with `{}` or `new Object`.
         return value === Object(value);
      },
         
      toArray: function (value) { // Converts an array-like object to an array - for example `arguments`.
         return Array.prototype.slice.call(value);
      },

      prepareArgs: function (args, element) { // Convert arguments to an Array (`utils.toArray`) and prepend `element`.
         args = utils.toArray(args);
         args.unshift(element);
         return args;
      },

      getObjKeyByValue: function (obj, value) { // Get object key by value.
         for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
               if (obj[key] === value) return key;
            }
         }
      },

      prepareReturn: function (type) { // Prepares the return value to enable chaining.
         return window[utils.getObjKeyByValue(types, type)];
      },

      retrieve: function (value, fallback) { // Returns fallback if the value is undefined, otherwise value.
         return value === undefined ? fallback : value;
      },

      serialize: function (data) {
         return JSON.stringify(data);
      },

      unserialize: function (data) {
         if (data === undefined) return undefined;
         return JSON.parse(data);
      }

   };

   var _storage = function () {
         return _storage.get.apply(this, arguments);
   };

   window.storage = function () {
      return storage.get.apply(storage, arguments);
   };

   window.session = function () {
      return session.get.apply(session, arguments);
   };

   _storage.set = function (type, key, value) {
      
      if (utils.isPlainObj(key)) {

         for (var k in key) {
            if (key.hasOwnProperty(k)) type.set(k, key[k]);
         }

      } else type.setItem(key, utils.serialize(value));

      return utils.prepareReturn(type); // to enable chaining

   };

   _storage.invert = function (type, key) {
      return type.set(key, !(this.get(key)));
   };

   _storage.add = function (type, key, value) {
      return this.set(type, key, this.get(type, key) + parseInt(value, 10));
   };
   
   _storage.increase = function (type, key, value) {
      return this.add(type, key, 1);
   };
   
   _storage.decrease = function (type, key, value) {
      return this.add(type, key, -1);
   };

   _storage.concat = function (type, key, string) { // append?
      return this.set(key, this.get(key) + string);
   };

   _storage.push = function (type, key, value) {
      
      var args = utils.toArray(arguments),
           arr = this.get(key);
      
      args.shift();
      arr.push.apply(arr, args);

      return this.set(key, arr);

   }

   _storage.extend = function (type, key, k, v) { // variables?

      var value = this.get(type, key, {});

      if (utils.isPlainObj(k)) {

         for (var _k in k) {
            if (k.hasOwnProperty(_k)) value[_k] = k[_k];
         }

      } else value[k] = v;

      return this.set(type, key, value);

   };

   _storage.remove = function (type, keys) {

      keys = utils.isArray(keys) ? keys : utils.toArray(arguments);

      for (var i = 0, l = keys.length; i < l; i++) {
         delete type[keys[i]];
      }

      return utils.prepareReturn(type);

   };

   _storage.empty = function (type) {

      type.clear();

      return utils.prepareReturn(type);

   };

   _storage.get = function (type, keys, fallback) {
      fallback = fallback || undefined;

      if (utils.isArray(keys)) {
         var result = {};

         for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            result[key] = this.get(type, key, fallback);
         }

         return result;
      } else return utils.retrieve(utils.unserialize(type.getItem(keys)), fallback);

   };

   _storage.all = function (type) {
      
      return JSON.parse(JSON.stringify(type)); // Yep, I know this is insanely unelegant. But it seems to be the fastest way to remove the localStorage / sessionStorage methods and copy the other values. Also it makes the file size smaller, because I don't have to include an Object.clone polyfill.

   };

   var methods = 'set invert add increase decrease concat push extend remove empty get all'.split(' '); // Methods of _storage that need to be copied to storage and session.
   
   var types = {
      storage: localStorage,
      session: sessionStorage
   };

   for (var i = 0, l = methods.length; i < l; i++) {

      var method = methods[i];

      for (var name in types) {

         if (!(types.hasOwnProperty(name))) continue;

         var storeType = types[name];

         window[name][method] = function (method, storeType) {
            return function () {
               var args = utils.prepareArgs(arguments, storeType);
               return _storage[method].apply(_storage, args);
            };
         }(method, storeType);

      }

   }

}(window);
