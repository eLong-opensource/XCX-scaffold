var __dirname = "components/calendar/page";
var __overwrite = require("../../../utils/overwrite.js");
(function(require, Page) {
    var api = require("utils/api")(__dirname);
    var app = getApp();
    Page({
        toViewIndex: 0, //记录 所选中的区域位置 出现在可视区
        data: {
            count: 6,
            today: 0,
            start: null,
            end: null,
            date: null,
            months: [],
            dates: [],
            zh: {
                split: "/",
                rest: "休",
                work: "班",
                overflow: "如果您需要入住酒店超过20天，请致电   400-666-1166，我们会竭诚为您服务。",
                day: "日",
                week: "周",
                month: "月",
                year: "年",
                totalText: "共${this.state.total}晚）",
                dayinfo: ["今天", "明天", "后天"],
                weekinfo: ["日", "一", "二", "三", "四", "五", "六"]
            },
            classNames: {
                start: "start",
                end: "end",
                range: "range",
                bottom: "bottom",
                button: "button",
                enable: "enable",
                today: "today"
            },
            festivaltag: {
                "1-1": ["元旦"],
                "2-14": ["情人节"],
                "3-8": ["妇女节"],
                "5-1": ["劳动节"],
                "6-1": ["儿童节"],
                "10-1": ["国庆"],
                "12-24": ["平安夜"],
                "12-25": ["圣诞节"]
            },
            cnfestivaltag: {
                "2016-2-7": ["除夕"],
                "2016-2-8": ["春节"],
                "2016-2-22": ["元宵节"],
                "2016-4-4": ["清明"],
                "2016-5-1": ["劳动节"],
                "2016-6-9": ["端午节"],
                "2016-6-19": ["父亲节"],
                "2016-7-1": ["建党"],
                "2016-8-1": ["建军"],
                "2016-8-9": ["七夕"],
                "2016-8-17": ["中元节"],
                "2016-9-10": ["教师节"],
                "2016-9-15": ["中秋节"],
                "2016-10-9": ["重阳节"],
                "2016-10-31": ["万圣节"],
                "2016-11-24": ["感恩节"],
                "2017-1-5": ["腊八"],
                "2017-1-23": ["小年"],
                "2017-1-27": ["除夕"],
                "2017-2-14": ["情人节"],
                "2017-2-11": ["元宵节"]
            },
            holidaytag: {
                "2016-1-1": ["休"],
                "2016-1-2": ["休"],
                "2016-1-3": ["休"],
                "2016-2-6": ["班"],
                "2016-2-7": ["休"],
                "2016-2-8": ["休"],
                "2016-2-9": ["休"],
                "2016-2-10": ["休"],
                "2016-2-11": ["休"],
                "2016-2-12": ["休"],
                "2016-2-13": ["休"],
                "2016-2-14": ["班"],
                "2016-4-2": ["休"],
                "2016-4-3": ["休"],
                "2016-4-4": ["休"],
                "2016-4-30": ["休"],
                "2016-5-1": ["休"],
                "2016-5-2": ["休"],
                "2016-6-9": ["休"],
                "2016-6-10": ["休"],
                "2016-6-11": ["休"],
                "2016-6-12": ["班"],
                "2016-9-15": ["休"],
                "2016-9-16": ["休"],
                "2016-9-17": ["休"],
                "2016-9-18": ["班"],
                "2016-10-1": ["休"],
                "2016-10-2": ["休"],
                "2016-10-3": ["休"],
                "2016-10-4": ["休"],
                "2016-10-5": ["休"],
                "2016-10-6": ["休"],
                "2016-10-7": ["休"],
                "2016-10-8": ["班"],
                "2016-10-9": ["班"]
            },
            scrollViewHeight: 667 //scroll-view默认高度
        },
        /** ========= **/
        initStart: function (start, today) {
          if (typeof(start) == "string") {
              start = start.replace(/-/g, '/');
          }
          if (start) {
              return new Date(start);
          }
          var n = new Date(today);
          var t = n.getHours();
          if (t >= 0 && t <= 5) {
              n.setDate(n.getDate() - 1);
          }
          n.setHours(0);
          n.setMinutes(0);
          n.setSeconds(0);
          n.setMilliseconds(0);
          return n;
        },
        initEnd: function (end, today) {
          if (typeof(end) == "string") {
              end = end.replace(/-/g, '/');
          }
          if (end) {
              return new Date(end);
          }
          var n = new Date(today);
          var t = n.getHours();
          if (!(t >= 0 && t <= 5)) {
              n.setDate(n.getDate() + 1);
          }
          n.setHours(0);
          n.setMinutes(0);
          n.setSeconds(0);
          n.setMilliseconds(0);
          return n;
        },
        /** ========= **/
        onLoad: function(options) {
          var _this = this,
          _today = options.today ? new Date(options.today) : new Date(),
          _initStart = _this.initStart(options.begin, _today),
          _start = _this.initStart(options.begin, _today),
          _initEnd = _this.initEnd(options.end, _today),
          _end = _this.initEnd(options.end, _today),
          _date = (function (start, index) {
            var begin = new Date(Math.min(start, new Date()))
            return new Date(begin.getFullYear(), begin.getMonth() + 1, 0)
          })(options.start || _start),
          _dates = [],
          _months = []

          // 设置整点
          _today.setHours(0)
          _today.setMinutes(0)
          _today.setSeconds(0)
          _today.setMilliseconds(0)

          // setData
          _this.setData({
            today: _today,
            initStart: _initStart,
            initEnd: _initEnd,
            start: _start,
            end: _end,
            date: _date
          })

          // data.dates压栈
          for (var i = 0; i < _this.data.count; i++, _this.toViewIndex++) {
            var _newDate = new Date(_date.getFullYear(), _date.getMonth() + i, 1)
            _months.push(_newDate.getFullYear() + '年' + (_newDate.getMonth() + 1) + '月')
            _dates.push(_this.createDate(_newDate))
          }
          _this.setData({
            dates: _dates,
            months: _months
          })
        },
        onReady: function() {
            this.setScrollViewHeight();
        },
        select: function(e) {
            var day = e.target.dataset.value;
            var value = e.target.dataset.day;
            if (!value) {
                return
            }
            var start = this.data.start
            var end = this.data.end;
            var valueDate = new Date(value);
            var today = Math.min(this.data.start, this.data.today)

            var d = Math.round(((valueDate - today) / (86400000)));
            var endd = Math.round(((valueDate - new Date(start)) / (86400000))) + 1;

            if (d < 0 && !this.isLateMightModel(valueDate)) {
                return
            }
            //debugger;
            if (this.data.start && +valueDate == +this.data.start && !this.data.end) {
                // this.data.start = null
                // this.data.end = null;
                this.setData({
                  start: null,
                  enb: null
                })
                this.onChange(value, null, null);
                return;
            }
            // //开始日期小于开始日期
            if (valueDate < this.data.start && !this.data.end) {
                // this.data.start = new Date(value)
                // this.data.end = null;
                this.setData({
                  start: new Date(value),
                  end: null
                })
                this.onChange(value, valueDate, null);
                return;
            }

            //不能大于20天
            if (this.data.start && this.data.end == null && endd > 20) {
                api.showModal(this.data.zh.overflow);
                return
            }
            //不能入离同天
            if (this.data.start && this.getDateString(value, "-") == this.getDateString(this.data.start, "-") && !this.data.end) {
                return
            }
            if (start && end) {
                // this.data.start = new Date(value)
                // this.data.end = null;
                this.setData({
                  start: new Date(value),
                  end: null
                })
                this.onChange(value, this.data.start, null);
                return;
            }
            if (start && !end) {
                // this.data.start = new Date(start)
                // this.data.end = new Date(value);
                this.setData({
                  start: new Date(start),
                  end: new Date(value)
                })
                this.onChange(value, this.data.start, this.data.end);
                return;
            }

            if (!start && !end) {
                // this.data.start = new Date(value)
                // this.data.end = null
                this.setData({
                  start: new Date(value),
                  end: null
                })
                this.onChange(value, this.data.start, this.data.end);
                return;
            }
        },
        setScrollViewHeight: function() {
            api.getSystemInfo({
                success: function(data) {
                    this.setData({
                        toView: this.data.toView,
                        scrollViewHeight: data.windowHeight
                    });
                }.bind(this)
            });
        },
        onChange: function(value, start, end) {
            //debugger;
            var self = this,
            _dates = self.data.dates;
            _dates.map(function(items, i1) {
                items.map(function(item, i2) {
                    var c = self.getItemClass(item.day, item.day.split('/')[2], start, end);
                    item.classNames = c
                    item.txt = +self.data.start == +new Date(item.day) ? "入住" : +self.data.end == +new Date(item.day) ? "离店" : ""
                })
            });
            this.setData({
                dates: _dates
            });
            if (this.data.start && this.data.end) {
                setTimeout(api.Navigate.back, 100);
            }
        },
        onUnload: function() {
            //完整选择了入离日后触发事件
            if (this.data.start && this.data.end && (this.data.start != this.data.initStart || this.data.end != this.data.initEnd)) {
                this.fireEvent("select", {
                    start: this.data.start,
                    end: this.data.end
                });
            }
        },
        getShowDate: function(index, day) {
            var txt = new Date(day);
            if (!txt) {
                return;
            }
            if (this.isLateMightModel(txt)) {
                return '深夜';
            }
            var festival = this.getFestivaltag([txt.getFullYear(), txt.getMonth() + 1, txt.getDate()].join('-'));
            var today = Math.min(this.data.start, this.data.today)
            var d = Math.round(((new Date(day + " 00:00:00") - today) / (86400000)));
            if (this.getDateString(this.data.start) == this.getDateString(new Date(day))) {
                return txt.getDate();
            }
            if (this.getDateString(this.data.end) == this.getDateString(new Date(day))) {
                return txt.getDate();
            }
            if (d == 0) {
                return this.data.zh.dayinfo[0];
            }
            return festival || txt.getDate();
        },
        getDateString: function(date, split) {
            if (typeof(date) == "string") {
                date = new Date(date);
            }
            split = split || this.data.zh.split;
            var tempArr = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
            return tempArr.join(split);
        },
        getDay: function(tempDate, tempDateStr, day) {
            var fest = this.data.festivaltag[tempDateStr] || "";
            //var today = this.setToday(tempDate);
            var select = this.select;
            var ret = "";
            ret = day;
            return ret;
        },
        getFestivaltag: function(date) {
            var md = [date.split('-')[1], date.split('-')[2]].join('-');
            return this.data.festivaltag[md] || this.getCnfestivaltag(date);
        },
        getCnfestivaltag: function(date) {
            return this.data.cnfestivaltag[date];
        },
        getHolidaytag: function(date) {
            var txt = new Date(date);
            var dateArr = [txt.getFullYear(), txt.getMonth() + 1, txt.getDate()];
            return this.data.holidaytag[dateArr.join('-')];
        },
        getFestival: function(index) {
            var dateArr = [this.data.date.getFullYear(), this.data.date.getMonth() + 1, txt];
            var festival = this.getHolidaytag[dateArr.join('-')];
            var tempDate = new Date(dateArr.join('/'));
            return festival;
        },
        getItemClass: function(day, value, start, end) {
            if (!day) {
                return;
            }
            var date = new Date(day);
            var strDate = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
            var festival = this.getFestivaltag(strDate);
            var holidaytag = this.getHolidaytag(strDate);
            var today = Math.min((this.data.start || new Date()), this.data.today)
            var d = Math.round(((date - today) / (86400000)));
            var _start = new Date(start);
            var _end = new Date(end)
            var clsArr = [];
            var day = date.getDay();


            if (d >= 0 || this.isLateMightModel(date)) {
                clsArr.push(this.data.classNames.enable);
                if (day == 0 || day == 6 || festival || holidaytag) {
                    if (holidaytag && holidaytag[0] == "班") {
                        clsArr.push("work");
                    } else {
                        clsArr.push("sunday");
                    }
                }
            }
            if (d == 0) {
                clsArr.push(this.data.classNames.today);
            }

            if (this.getDateString(date) == this.getDateString(_start)) {
                clsArr = [this.data.classNames.start];
                // this.data.toView = 'toView_' + this.toViewIndex;
                this.setData({
                  toView: 'toView_' + this.toViewIndex
                })
            }

            if ((date > _start && date < _end)) {
                clsArr = [this.data.classNames.range];
            }
            if (value && start && this.getDateString(date) == this.getDateString(_end)) {
                clsArr = [this.data.classNames.end];
            }
            return value ? clsArr.join(' ') : "";
        },
        createDate: function(date) {
            var returnValue = [];
            var day = date.getDate();
            var beginDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
            var nDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            var pushObj = {
                day: "",
                value: "",
                showDay: ""
            };
            var len = 43 - (42 - nDays - beginDay);
            for (var i = 1; i < len; i++) {
                var tempDate = new Date(date.getFullYear(), date.getMonth(), (i - beginDay), 0, 0, 0);
                var d = Math.round(((tempDate - this.today) / (86400000))) + 1;
                var tempDateStr = this.getDateString(tempDate);
                if (i > beginDay && i <= nDays + beginDay) {
                    var _day = this.getDay(tempDate, tempDateStr, i - beginDay);
                    var _class = this.getItemClass(tempDateStr, _day, this.data.start, this.data.end);
                    pushObj = {
                        day: tempDateStr,
                        value: _day,
                        showDay: this.getShowDate(i, tempDateStr),
                        classNames: _class,
                        work: _class.match('sunday') ? "休" : _class.match('work') ? "班" : "",
                        txt: +this.data.start == +new Date(tempDateStr) ? "入住" : +this.data.end == +new Date(tempDateStr) ? "离店" : ""
                    };
                }
                returnValue.push(pushObj);
            }
            return returnValue;
        },
        isLateMightModel: function(target) {
            var time = new Date;
            var t = time.getHours();
            return (t < 5 && (+target + 86400000) == +this.data.today);
        }
    });
})(__overwrite.require(require, __dirname), __overwrite.Page);
