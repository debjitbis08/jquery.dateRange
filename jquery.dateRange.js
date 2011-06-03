(function($) {
  $.fn.dateRange = function(options) {

      var defaults = {selected: null, startWith: null, minimumDate: null, maximumDate: null},
          opts = $.extend({}, defaults, options),
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          abbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          daySelector = 'tbody td:not(:empty)';

      return this.each(function() {
        if (this.dateRange) { return false; }
      
        var $input = $(this),
            $container, selecting, selected, $prev, $next, cache = {},

        self = {
          initialize: function() {               

            var now, prev;

            $container = self.initializeContainer().hide();
            $prev = $container.find('div.prev').click(self.loadPrevious);
            $next = $container.find('div.next').click(self.loadNext);

            cache.months = {};

            if (opts.startWith) {
              now = opts.startWith[1];
            }
            else {
              now = new Date();
              now.setDate(1);
            }

            prev = new Date(now.getFullYear(), now.getMonth()-1, 1);
            $prev.after(self.buildMonth(now));
            $prev.after(self.buildMonth(prev));

            $input.click(function() {
              self.show();
              return false;
            }).keydown(function(e) {
              if (e.keyCode === 13) { self.entered(); }
            });

            $(document).keydown(function(e) {
              if (e.keyCode === 27) { self.hide(); }
            }).click(self.hide);

            $container.delegate(daySelector, 'click', self.clicked);
            $container.click(function(){return false;});

            if (opts.startWith !== null) {
              selected = opts.startWith;
              self.rangeSelected();
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
            return new Date(value);
          },
          show: function() {
            selecting = [];
            $container.slideDown();
          },
          hide: function() {
            $container.slideUp('slide');
          },
          clicked: function() {

            var $td = $(this).addClass('selected'),
                date = $td.closest('table').data('date');

            $container.find('td.highlight').removeClass('highlight');
            selecting.push(new Date(date.getFullYear(), date.getMonth(), $td.text()));
            selected = selecting;
            if (selecting.length < 2) {
              $input.val(self.format(selected[0]) + ' - ');
            }
            else if (selecting.length === 2) {
              if (selected[0] > selected[1]) {
                var x = selected[0];
                selected[0] = selected[1];
                selected[1] = x;
              }
              $input.val(self.format(selected[0]) + ' - ' + self.format(selected[1]));
              self.highlight($container.find('table:first'));
              self.highlight($container.find('table:last'));
              selecting = [];
            }
          },
          done: function () {
            if (selected.length === 2) {
              self.rangeSelected();
            }
            self.hide();
          },
          rangeSelected: function() {            
            if (selected[0] > selected[1]) {
              var x = selected[0];
              selected[0] = selected[1];
              selected[1] = x;
            }
            $input.val(self.format(selected[0]) + ' - ' + self.format(selected[1]));
            self.highlight($container.find('table:first'));
            self.highlight($container.find('table:last'));
            if (opts.selected !== null) { opts.selected(selected); } 
          },
          highlight: function($table) {

            if (selected === undefined || selected === null || selected.length !== 2) { 
              $table.find('td.highlight').removeClass('highlight');
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
              $tds.get(i).className = 'highlight';
            }               
          },
          loadPrevious: function() {               
            $container.children('table:eq(1)').remove();
            var date = $container.children('table:eq(0)').data('date');
            $container.find('div.prev').after(self.buildMonth(new Date(date.getFullYear(), date.getMonth()-1, 1)));
          },
          loadNext: function() {               
            $container.children('table:eq(0)').remove();
            var date = $container.children('table:eq(0)').data('date');
            $container.find('table').after(self.buildMonth(new Date(date.getFullYear(), date.getMonth()+1, 1)));            
          },
          initializeContainer: function() {

            var $container, $navPrev, $navNext, $doneButton;

            $container = $input.siblings('.calendar');

            $doneButton = $container.find('a.button');
            $doneButton.click(function (e) {e.preventDefault(); self.done();});

            $navPrev = $('<div>').addClass('prev').prependTo($container);
            $navPrev.html('&lsaquo;');

            $navNext = $('<div>').addClass('next').insertBefore($doneButton);
            $navNext.html('&rsaquo;');
            
            return $container;
          },
          buildMonth: function(date) {

            var fullYear = date.getFullYear(),
                month = date.getMonth(),
                cacheKey = fullYear.toString() + month.toString(),
                table = cache.months[cacheKey],
                first = new Date(fullYear, month, 1),
                last = new Date(fullYear, month + 1, 0),
                firstDay = first.getDay(),
                totalDays = last.getDate(),
                weeks = Math.ceil((totalDays + firstDay) / 7),
                $table, header, cell, i, j, row, count = 0, daysRow, thead, caption;

            if (!table) {

              table = document.createElement('table');

              caption = table.createCaption();
              caption.innerHTML = months[date.getMonth()] + ' ' + date.getFullYear();

              for (i = 0; i < weeks; i += 1) {
                row = table.insertRow(-1);
                for(j = 0; j < 7; j += 1) {
                  count += 1;
                  cell = row.insertCell(-1);
                  if (count > firstDay && count <= totalDays+firstDay) {
                    $(cell).html('<span>' + (count - firstDay) + '</span>');
                  }
                }
              }

              thead = table.createTHead();
              daysRow = thead.insertRow(0);

              for(i = 0; i < 7; i += 1) {
                cell = daysRow.insertCell(-1);
                cell.innerHTML = days[i];
              }

              cache.months[cacheKey] = $.clone(table);
            }
            $table = $(table).data('date', date);

            self.highlight($table);

            if (opts.minimumDate && opts.minimumDate >= first) {
              $container.addClass('prevHidden');
            }
            else {
              $container.removeClass('prevHidden');
            }
            if (opts.maximumDate && opts.maximumDate <= last) {
              $container.addClass('nextHidden');
            }
            else {
              $container.removeClass('nextHidden');
            }

            return $table;
          },
          format: function(date) {
            return abbreviations[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
          }
        };
        this.dateRange = self;
        self.initialize();
      });
  };
})(jQuery);
