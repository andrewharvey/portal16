'use strict';


var angular = require('angular'),
    _ = require('lodash');

require('./occurrenceChart.resource');

angular
    .module('portal')
    .directive('occurrenceChart', occurrenceChartDirective);

/** @ngInject */
function occurrenceChartDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceChart/occurrenceChart.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            options: '=',
            api: '='
        },
        link: chartLink,
        controller: occurrenceChart,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function chartLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceChart($http, $state, $scope, OccurrenceChartBasic, Highcharts) {
        var vm = this;
        vm.logScale = true;
        vm.loading = true;
        function updateChart(dimension) {
            var filter = vm.filter || {};
            var q = _.merge({}, filter, {chartDimension: dimension});
            OccurrenceChartBasic.query(q).$promise
                .then(function (data) {
                    vm.loading = false;
                    vm.data = data;
                    vm.logScale = vm.logScale && data.categories.length > 1;
                    setChartHeight();
                    vm.chartElement.style.height = vm.chartHeight + 'px';
                    if (vm.myChart) {
                        vm.myChart.destroy();
                    }

                    if (vm.options.type == 'BAR') {
                        vm.myChart = Highcharts.chart(asBarChart(data, vm.logScale));
                    } else if (vm.options.type == 'PIE') {
                        vm.myChart = Highcharts.chart(asPieChart(data));
                    } else if (vm.options.type == 'LINE') {
                        vm.myChart = Highcharts.chart(asLineChart(data, vm.logScale));
                    }
                });
        }

        function setChartHeight() {
            var categories = _.get(vm.data, 'categories.length');
            if (vm.options.type == 'BAR') {
                categories = categories || 10;
                vm.chartHeight = categories * 20 + 100;
            } else if (vm.options.type == 'PIE') {
                if (categories <= 3) {
                    vm.chartHeight = 300;
                } else {
                    vm.chartHeight = 400;
                }
            } else {
                vm.chartHeight = 250;
            }
        }

        vm.changeDimension = function (dimension) {
            updateChart(dimension);
        };

        vm.toggleBarChart = function () {
            vm.myChart.destroy();
            setChartHeight();
            vm.chartElement.style.height = vm.chartHeight + 'px';
            vm.myChart = Highcharts.chart(asBarChart(vm.data, vm.logScale));
        };

        vm.togglePieChart = function () {
            vm.myChart.destroy();
            setChartHeight();
            vm.chartElement.style.height = vm.chartHeight + 'px';
            vm.myChart = Highcharts.chart(asPieChart(vm.data));
        };

        function asColumnChart(data, isLogaritmic) {
            var chartConfig = asBarChart(data, isLogaritmic);
            chartConfig.chart.type = 'column';
            return chartConfig;
        }

        function asBarChart(data, isLogaritmic) {
            return {
                chart: {
                    animation: false,
                    type: 'bar',
                    renderTo: vm.chartElement,
                    className: 'chart-field-' + vm.options.dimension
                },
                plotOptions: {
                    series: {
                        animation: false,
                        point: {
                            events: {
                                click: function () {
                                    vm.occurrenceSearch(vm.data.categoryKeys[this.index]);
                                }
                            }
                        },
                        pointWidth: 20,
                        pointPadding: 0,
                        groupPadding: 0
                    }
                },
                legend: {
                    enabled: false
                },
                bar: {
                    minPointLength: 10
                },
                title: {
                    text: ''//data.title
                },
                xAxis: {
                    categories: data.categories,
                    visible: true
                },
                yAxis: {
                    title: {
                        text: 'Occurrence count'
                    },
                    type: isLogaritmic ? 'logarithmic' : 'linear',
                    minorTickInterval: isLogaritmic ? 1 : undefined,
                    visible: true
                },
                series: [{
                    name: 'Occurrences',
                    data: data.series[0].data
                }],
                credits: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false
                        }
                    }
                }
            }
        }

        function asPieChart(data) {
            var serie = data.series[0].data.map(function (e, i) {
                return {
                    name: data.categories[i],
                    y: e
                }
            }).sort(function (a, b) {
                return b.y - a.y;
            });

            var lowCount = data.series[0].total / 50;
            var lowIndex = _.findIndex(serie, function (a) {
                return a.y < lowCount;
            });
            lowIndex = Math.min(20, lowIndex);
            var majorSerie = serie;
            if (lowIndex != -1) {
                lowIndex = Math.max(lowIndex, 5);
                majorSerie = serie.slice(0, lowIndex);
                var minor = serie.slice(lowIndex);
                if (minor.length > 0) {
                    majorSerie.push({y: _.sumBy(minor, 'y'), name: 'other'});
                }
            }

            return {
                chart: {
                    animation: false,
                    type: 'pie',
                    renderTo: vm.chartElement,
                    className: 'chart-field-' + vm.options.dimension
                },
                plotOptions: {
                    series: {
                        animation: false,
                        point: {
                            events: {
                                click: function () {
                                    vm.occurrenceSearch(vm.data.categoryKeys[this.index]);
                                }
                            }
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''//data.title
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                xAxis: {
                    visible: false
                },
                yAxis: {
                    visible: false
                },
                series: [{
                    name: 'Occurrences',
                    data: majorSerie
                }],
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false
                        }
                    }
                }
            };
        }

        vm.occurrenceSearch = function(value) {
            var filter = vm.filter || {};
            var q = _.merge({}, filter);
            q[vm.data.dimension] = value;
            $state.go('occurrenceSearchTable', q);
        };

        function asLineChart(data, isLogaritmic){
            if (data.categories.length < 20) {
                return asColumnChart(data, isLogaritmic);
            }

            var lineData = _.zip(_.map(data.categories, function(e){return Date.UTC(_.toSafeInteger(e), 0, 1)}), data.series[0].data);
            return {
                chart: {
                    type: 'area',
                    zoomType: 'x',
                    renderTo: vm.chartElement,
                    className: 'chart-field-' + vm.options.dimension
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Occurrence count'
                    },
                    min: 0
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    area: {
                        trackByArea: true,
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.getOptions().colors[0]],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.5).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null,
                        point: {
                            events: {
                                click: function () {
                                    vm.occurrenceSearch(data.categoryKeys[this.index]);
                                }
                            }
                        }
                    }
                },
                series: [{
                    type: 'area',
                    name: 'occurrences per year',
                    data: lineData
                }],
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false
                        }
                    }
                }
            };
        }

        $scope.create = function (element) {
            vm.chartElement = element[0].querySelector('.chartArea');
            updateChart(vm.options.dimension);
        };

        //create API
        vm.api.print = function () {
            vm.myChart.print();
        };
        vm.api.png = function () {
            vm.myChart.exportChart();
        };
        vm.api.svg = function(){
            vm.myChart.exportChart({
                type: 'image/svg+xml'
            });
        };
        vm.api.getTitle = function () {
            return _.get(vm.data, 'title');
        };
        vm.api.asPieChart = function () {
            vm.options.type = 'PIE';
            return vm.togglePieChart();
        };
        vm.api.asBarChart = function () {
            vm.options.type = 'BAR';
            return vm.toggleBarChart();
        };

        vm.api.getOptions = function () {
            return {
                actions: []
            };
        };

        if (Object.freeze) {
            Object.freeze(vm.api);
        }

        $scope.$watchCollection(function () {
            return vm.filter
        }, function () {
            updateChart(vm.options.dimension);
        });
    }
}

//var options = {
//    fields: {
//        basis_of_record:
//    }
//};


/**
 * OVERALL IDEA
 * for any occ filter.
 * define a field of a fixed subset (BoR, year, month, species?, latitude? decade? ...)
 * depending on type a fixed number of chart types.
 * Basically simlpy filter as is. add facet as per selected field. If key, then resolve. could start with only allowing enums.
 * defaults to bar chart. doughnut if single value per type. BoR or kingdom fx. Issue not.
 * for bar charts only?: similar to table layout: if several species (or another type) selected, then do breakdown per type? months fx. so basically. choose field (say months). defaults to counts per month, but option to choose counts per other field per month - fx selected species or all of an enum
 *
 *
 * CHART TYPES
 * bar chart.
 * pie.
 * map country chloropleth
 * ¿ plain list ? seems useful for issues fx (almost just a vertical bar chart).
 * table. choose additional dimension. At least one enum (else we cannot write 'other'). iterate enums and add to filter (overwrite enum filter if already there)) and facet per other dimension. also do a plain facet on enum diff is other.
 *
 * MORE
 * more button for more facets (increase facetLimit). always ask for one more facet than asked for to decide on showing more button.
 *
 * INTERACTIVE
 * labels optional clickable to add as filter.
 *
 * SPECIAL CASES
 * taxonomy special case. interactive widget.
 * Years (and elevation and other continuous numbers) seem special as well in that you would typically want them not ordered by count, but in order.
 *
 * Years (and other continuous nr)
 * seems tricky. How to handle this?
 * Start by asking for facets with a large number, say 500. If there are more, then find extend first by asking for extremes and dividing in half?
 * Then select an appropriate interval?
 * Then filter per interval to get counts.
 *
 * fullscreen? download image/pdf? download csv data? how about citation then?
 *
 */

/*
 * Have a fixed set of allowed dimensions that is supported.
 * for each dimension a set of configuration options
 *
 * fx chart options: bar, pie, line, ...
 * and for each type (or generic) there is defaults/suggestions based on type and data.
 *
 * cases:
 * no data : show text
 * 1 value : show styled box
 * few values : pie or bar or column as default. table, line as options
 * standard : bar or column as default. pie, line, table
 * many values : line or table as default. bar as option ?
 *
 * views could be: pie, bar, line, table, column
 */

module.exports = occurrenceChartDirective;