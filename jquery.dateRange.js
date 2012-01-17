/*jslint browser: true, maxerr: 50, white: true, indent: 2, newcap: true, onevar: true, jquery: true, curly: true, eqeqeq: true, undef: true */
/*global jQuery: false */

(function($) {
  var cache = {};
  $.fn.dateRange = function(options) {
 
      var defaults = {selected: null, startWith: null, minimumDate: null, maximumDate: null,
            actionImageUp: "./button_n_arrow_down.gif",
            actionImageDown: "./button_n_arrow_up.gif",
            show: null,
            hide: null,
            shortcuts: [],
            rangeStartTitle: 'Start Date:',
            rangeEndTitle: 'End Date:',
            doneButtonText: 'Done',
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            shortDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
          },
          opts = $.extend({}, defaults, options),
          months = opts.months,
          abbreviations = opts.shortMonths,
          days = opts.shortDays,
          daySelector = 'tbody td:not(.disabled)',
          yearSelector, monthSelector;

      return this.each(function() {
        if (this.dateRange) { return false; }
     
        var $input = $(this),
            $container, selecting, selected,
 
        self = {
          initialize: function() {              
 
            var now, prev, year, yearOptions = '', monthOptions, startYear, endYear, month;
            cache.months = cache.months || {};

            if (opts.startWith) {
              now = opts.startWith[1];
            }
            else {
              now = new Date();
              now.setDate(1);
            }
 
            yearSelector = $(document.createElement('select')).addClass('yearSelect');
            if (opts.minimumDate) {
              startYear = opts.minimumDate.getFullYear();
            }
            else {
              startYear = now.getFullYear() - 10;
            }
            if (opts.maximumDate) {
              endYear = opts.maximumDate.getFullYear();
            }
            else {
              endYear = now.getFullYear() + 10;
            }
            for (year = startYear; year <= endYear; year += 1) {
              yearOptions += '<option value="' + year +'">' + year + '</option>';
            }
            yearSelector.html(yearOptions);
 
            monthSelector = $(document.createElement('select')).addClass('monthSelect');
            for (month = 0; month < 12; month += 1) {
              monthOptions += '<option value="' + month +'">' + months[month] + '</option>';
            }
            monthSelector.html(monthOptions);
            
            $container = self.initializeContainer().hide();
 
            $doneButton = $container.find('.button');
            $doneButton.click(function (e) {e.preventDefault(); self.done();});
            if (opts.startWith) {
              self.buildMonth(new Date(opts.startWith[0].getFullYear(), opts.startWith[0].getMonth(), 1), $container.find('.start table'));
              self.buildMonth(new Date(opts.startWith[1].getFullYear(), opts.startWith[1].getMonth(), 1), $container.find('.end table'));

              $('.start', $container[0]).find('select.monthSelect option[value="' + opts.startWith[0].getMonth() +'"]').attr('selected', true);
              $('.start', $container[0]).find('select.yearSelect option[value="' + opts.startWith[0].getFullYear() +'"]').attr('selected', true);
              $('.end', $container[0]).find('select.monthSelect option[value="' + opts.startWith[1].getMonth() +'"]').attr('selected', true);
              $('.end', $container[0]).find('select.yearSelect option[value="' + opts.startWith[1].getFullYear() +'"]').attr('selected', true);
            }
            else {
              prev = new Date(now.getFullYear(), now.getMonth()-1, 1);

              self.buildMonth(prev, $container.find('.start table'));
              self.buildMonth(new Date(now.getFullYear(), now.getMonth(), 1), $container.find('.end table'));

              $('.start', $container[0]).find('select.monthSelect option[value="' + prev.getMonth() +'"]').attr('selected', true);
              $('.start', $container[0]).find('select.yearSelect option[value="' + prev.getFullYear() +'"]').attr('selected', true);
              $('.end', $container[0]).find('select.monthSelect option[value="' + now.getMonth() +'"]').attr('selected', true);
              $('.end', $container[0]).find('select.yearSelect option[value="' + now.getFullYear() +'"]').attr('selected', true);
            }

            $container.find('.start .monthSelector').delegate('select', 'change', {'ref': '.start'}, self.replaceMonth);
            $container.find('.end .monthSelector').delegate('select', 'change', {'ref': '.end'}, self.replaceMonth);

            $container.find('.dateOptions').delegate('li', 'click', self.shortcutClicked);

            $input.parent('.inputContainer').click(function() {
              self.show();
              return false;
            }).keydown(function(e) {
              if (e.keyCode === 13) { self.entered(); }
            });
 
            $(document).keydown(function(e) {
              if (e.keyCode === 27) { self.hide(); }
            }).click(self.hide);
 
            $container.find('.start').delegate(daySelector, 'click', {'calendar': 'start'}, self.clicked);
            $container.find('.end').delegate(daySelector, 'click', {'calendar': 'end'}, self.clicked);
            $container.click(function(){return false;});
 
            if (opts.startWith !== null) {
              selected = opts.startWith;
              self.rangeSelected();
            }
            else {
              selected = [new Date(), new Date()];
            }
          },
          entered: function() {
            var values = $input.val().split('-'),
                from, to;
            if (values.length !== 2) { return false; }
 
            from = self.parseDate(values[0].replace(/^\s*/, '').replace(/\s*$/, ''));
            to = self.parseDate(values[1].replace(/^\s*/, '').replace(/\s*$/, ''));
            if (from === null || to === null) { return false; }
 
            selected = [from, to];
            self.rangeSelected();
            return false;
          },
          parseDate: function(value) {
            if (opts.parseDate) {
              return opts.parseDate(value);
            }
            return new Date(value);
          },
          show: function() {
            var _show = opts.show ? function () {opts.show.apply(self, [$container]);} : function(){$container.toggle();};
            selecting = [];
            _show();
            self.highlight($container.find('.start table'));
            self.highlight($container.find('.end table'));
          },
          hide: opts.hide || function() {
            $container.hide();
          },
          changeMonth: function (date, calendar) {
            calendar.find('.monthSelect').val(date.getMonth());
            self.buildMonth(new Date(date.getFullYear(), date.getMonth(), 1), calendar.find('table'));
          },
          shortcutClicked: function () {
            var allOptions = $container.find('.dateOptions li'),
                index = allOptions.index(this);

            selected = opts.shortcuts[index].callback();
            self.done();
            
            allOptions.removeClass('selected');
            $(this).addClass('selected');
            $container.find('td.selected').removeClass('selected');

            self.changeMonth(selected[0], $container.find('.start'));
            self.changeMonth(selected[1], $container.find('.end'));

            self.highlight($container.find('.start table'));
            self.highlight($container.find('.end table'));
          },
          clicked: function(e) {
 
            $container.find('td.selected').removeClass('selected');
 
            var $td = $(this).addClass('selected'),
                date = $td.closest('table').data('date');
 
            $container.find('td.highlight').removeClass('highlight');
            if (e.data.calendar === 'start') {
              if (selecting.length > 0) {
                selecting[0] = new Date(date.getFullYear(), date.getMonth(), $td.text());
              }
              else {
                selecting.push(new Date(date.getFullYear(), date.getMonth(), $td.text()));
              }
            }
            else if (e.data.calendar === 'end') {
              if (selecting.length > 1) {
                selecting[1] = new Date(date.getFullYear(), date.getMonth(), $td.text());
              }
              else if (selecting.length === 0) {
                selecting.push(selected[0] || opts.minimumDate);
                selecting.push(new Date(date.getFullYear(), date.getMonth(), $td.text()));
              }
              else {
                selecting.push(new Date(date.getFullYear(), date.getMonth(), $td.text()));
              }
            }
            selected[0] = selecting[0] || selected[0];
            selected[1] = selecting[1] || selected[1];
            if (selected[0] > selected[1]) {
              var x = selected[0];
              selected[0] = selected[1];
              selected[1] = x;
            }
            $input.val(self.format(selected[0]) + ' - ' + self.format(selected[1]));
            self.highlight($container.find('table:first'));
            self.highlight($container.find('table:last'));
          },
          done: function () {
            if (selected.length === 2) {
              self.rangeSelected();
            }
            $container.find('.dateOptions li').removeClass('selected');
            self.hide();
          },
          rangeSelected: function() {           
            if (selected[0] > selected[1]) {
              var x = selected[0];
              selected[0] = selected[1];
              selected[1] = x;
            }
            $input.val(self.format(selected[0]) + ' - ' + self.format(selected[1]));
            if (opts.selected !== null) { opts.selected(selected); }
          },
          highlight: function($table) {
 
            $table.find('td.highlight').removeClass('highlight');
            if (selected === undefined || selected === null || selected.length !== 2) {
              return;
            }
 
            var startDate, endDate, $tds, start, end, i;
 
            startDate = $table.data('date');
            endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
            if (startDate > selected[1] || endDate < selected[0]) { return; }
 
            $tds = $table.find(daySelector);
            start = selected[0].getMonth() < startDate.getMonth() || selected[0].getFullYear() < startDate.getFullYear() ? 0 : selected[0].getDate()-1;
            end = selected[1].getMonth() > endDate.getMonth() || selected[1].getFullYear() > endDate.getFullYear() ? $tds.length : selected[1].getDate();
            for(i = start; i < end; i += 1) {
              $($tds[i]).addClass('highlight');
            }              
          },
          validateShortcuts: function () {
            opts.shortcuts  = $.grep(opts.shortcuts, function (element, index) {
              var shortcutRange = element.callback();
              return !(shortcutRange [0] > opts.maximumDate || shortcutRange[1] < opts.minimumDate);
            });
          },
          initializeContainer: function() {
 
            var i, $container, $doneButton, htmlStructure = [], options = [];
 
            $input.wrap('<div class="calendarWrap"></div>');
            $container = $('<div class="calendar clearfix"></div>').insertAfter($input);
            $input.wrap('<span class="inputContainer"></span>')
                  .after('<span class="actionArrow"><img src="' + opts.actionImageUp +'"/></span>');

            htmlStructure.push('<div class="start">');
            htmlStructure.push('<span class="calHead">' + opts.rangeStartTitle + '</span>');
            htmlStructure.push('<span class="monthSelector"></span>');
            htmlStructure.push('<table></table>');
            htmlStructure.push('</div>');
            htmlStructure.push('<div class="end">');
            htmlStructure.push('<span class="calHead">' + opts.rangeEndTitle + '</span>');
            htmlStructure.push('<span class="monthSelector"></span>');
            htmlStructure.push('<table></table>');
            htmlStructure.push('</div>');
            htmlStructure.push('<button class="button"><span>' + opts.doneButtonText + '</span></button>');

            options.push('<ul class="dateOptions">');
            self.validateShortcuts();
            for ( i = 0; i < opts.shortcuts.length; i += 1) {
              options.push('<li>' + opts.shortcuts[i].element + '</li>');
            }
            options.push('</ul>');
            options.push('<div class="rangeSelector"></div>');
 
            $container.html(options.join(''));
            $container.find('.rangeSelector').html(htmlStructure.join(''));
            $container.find('span.monthSelector').append(monthSelector.clone()).append(yearSelector.clone());
            
            return $container;
          },
          replaceMonth: function(event) {
            var year = $container.find(event.data.ref + ' .yearSelect').val(),
                month = $container.find(event.data.ref + ' .monthSelect').val(),
                date = new Date(year, month, 1),
                table = $container.find(event.data.ref + ' table'),
                newTable = self.buildMonth(date, table);
            self.highlight(table);
          },
          buildMonth: function(date, table) {
 
            var fullYear = date.getFullYear(),
                month = date.getMonth(),
                cacheKey = fullYear.toString() + month.toString(),
                tableHtml = cache.months[cacheKey],
                first = new Date(fullYear, month, 1),
                last = new Date(fullYear, month + 1, 0),
                firstDay = first.getDay(),
                totalDays = last.getDate(),
                prevLast = new Date(fullYear, month, 0).getDate(),
                cell, i, j, row, count = 0, daysRow, thead, tableBody, extra = 1;
 
            if (!tableHtml) {
              tableBody = table.find('tbody').length ? table.find('tbody') : $(document.createElement('tbody')).appendTo(table);
              tableBody.html('');
              for (i = 0; i < 6; i += 1) {
                row = $(document.createElement('tr')).appendTo(tableBody);
                for(j = 0; j < 7; j += 1) {
                  count += 1;
                  cell = $(document.createElement('td')).appendTo(row);
                  if (count > firstDay && count <= totalDays+firstDay) {
                    cell.html($(document.createElement('a')).html(count - firstDay).addClass('calday'))
                        .addClass('calcell');
                  }
                  else if (count <= firstDay) {
                    cell.addClass('disabled')
                        .html(prevLast - firstDay + count);
                  }
                  else if (count > totalDays + firstDay) {
                    cell.addClass('disabled')
                        .html(extra);
                    extra += 1;
                  }
                }
              }
 
              if (!table.find('thead').length) {
                thead = $(document.createElement('thead')).prependTo(table);
                daysRow = $(document.createElement('tr')).appendTo(thead);
                daysRow.addClass('dayrow');
              }
 
              for(i = 0; i < 7; i += 1) {
                $(document.createElement('td')).appendTo(daysRow)
                  .addClass('daycell')
                  .html(days[i]);
              }
 
              cache.months[cacheKey] = tableHtml = table.html();
            }
            else {
              table.html(tableHtml);
            }
            table.data('date', date);
 
            return tableHtml;
          },
          format: function(date) {
            if (opts.formatDate) {
              return opts.formatDate(date);
            }
            return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          }
        };
        this.dateRange = self;
        self.initialize();
      });
  };
})(jQuery);

