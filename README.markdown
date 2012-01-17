# jquery.dateRange #

## About ##
This is a very simple and lightweight date range picker. It is extensible but not highly configurable. Do not expect a feature rich widget rather a base upon which something can be built per requirement. Thanks to [Karl Seguin](https://github.com/karlseguin/ "Karl Seguin's github profile") for this excellent work.

## Features Supported ##
* Lot more configuration options.
* Localization now supported but has to be supplied as configuration.
* Shortcut support, for example Last month, Previous Month etc. These have to be passed in through configuration, nothing built-in.

## Specifying Shortcuts ##
Shortcuts configuration property is an array of objects with two properties 'element' and 'callback'. The 'element' property will contain the text to be displayed and the callback a function which returns a date range. For example:

    shortcuts: [
      {
        'element': 'This Month',
        'callback': function () {
          var today = new Date(),
              from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0),
              to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

          return [from, today];
        }
      },
      {
        'element': 'Last Month',
        'callback': function () {
          var today = new Date(),
              from = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0),
              to = new Date(today.getFullYear(), today.getMonth(), 0, 0, 0, 0);
          
          return [from, to];
        }
      }
    ]



## Requirement ##
jQuery 1.6.1 (though I have not tested it with lower versions)

