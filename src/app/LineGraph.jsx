'use client';
import React, { useRef, useEffect, useState } from 'react';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import MultiSelect from './MultiSelect';

export default function LineGraph({data, uniqueYears, scope, attributeAverages, yearsForAverages, name}) {
    var riskFactors;
    var yearsObject;
    var factorList;
    var yearsForFilteredData = Array.from(uniqueYears);
    const [options, setOptions] = useState({
        chart: {
            type: "line",
        },
        title: {
            text: "Line Chart",
        },
        xAxis: {
            categories: yearsForFilteredData,
            title :{
                text: 'Year',
            }
        },
        yAxis: {
            title: {
                text: "Risk Rating",
            },
        },
        series: [
            {
                name: "Risk Rating",
                data: [1, 3, 2, 4, 5, 7, 6, 8, 9, 10, 11, 12],
            },
        ],
    });

    useEffect(() => {
        setOptions({
            ...options,
            series: [{ name:'Average Risk Rating', data: attributeAverages }],
            xAxis: {categories: Array.from(yearsForAverages)},
            title: {text: "Average Risk Rating for " +name},
            tooltip: {
                formatter: function () {
                    return (
                        ("<b><span style='font-size: 16px;'>"+name+"</b> ("+this.x+")</span>"+
                        "<br>Average Risk Rating: " + this.y+"</span>")
                    );
                },
            },
            });
    }, [attributeAverages]);
    
    useEffect(() => {
        const averagesByYear = Object.values(
            data.reduce((result, item) => {
                const year = item.Year;
                if (!result[year]) {
                    result[year] = { sum: 0, count: 0 };
                }
                result[year].sum += parseFloat(item["Risk Rating"]);
                result[year].count++;
                return result;
            }, {})
        );
        
        var roundedAverages = averagesByYear.map((item) =>
                parseFloat((item.sum / item.count).toFixed(3))
            );

        const preFilteredData = data.filter(
            (item) =>
            item['Asset Name'] === scope.name &&
            item['Lat'] === scope.latitude &&
            item['Long'] === scope.longitude &&
            item['Business Category'] === scope.category
        );

        const filteredData = preFilteredData.filter(
            (item) =>
            item['Year'] !== scope.year || item['Risk Rating'] === scope.risk
        );

        if (filteredData.length > 0) {
            yearsForFilteredData = filteredData.map(item => item.Year);
            roundedAverages = filteredData.map(item => parseFloat(item['Risk Rating']));
            riskFactors = filteredData.map(item => item['Risk Factors']);
            //console.log(riskFactors)
            var i = 0;
            yearsObject = yearsForFilteredData.reduce((acc, year) => {
                const obj = JSON.parse(riskFactors[i])
                const str = Object.keys(obj).map(key => `<br>${key}: ${(obj[key]).toFixed(2)}`)
                acc[i] = str;
                i++;
                return acc;
            }, {});
        }

        setOptions({
            ...options,
            series: [{ name: scope.name ? scope.name + " ("+scope.category+")" : 'Average Risk Rating', data: roundedAverages }],
            xAxis: {categories: yearsForFilteredData},
            title: {text: scope.name ? "Risk Rating for " + scope.name + " ("+scope.category+")" : "Average Risk Rating Over Time (All Assets)"},
            tooltip: {
                formatter: function () {
                    return (
                        (scope.name ?
                        "<b>" +
                        "<span style='font-size: 20px; padding: 10px 20px;'>" + scope.name + " </span></b>"+
                        "<span style='font-size: 20px; padding: 10px 20px;'>(" + this.x + ")</span>" +
                        "<span style='font-size: 20px;'></span><br>Risk Rating" + ": " + this.y +
                        "<br/><span style='font-size: 14px;'><b>Risk Factors</b></span>" + yearsObject[this.series.data.indexOf(this.point)]: "<b><span style='font-size: 14px;'>Average Risk Rating for "+this.x+": </b>" + this.y+"</span>")
                    );
                },
            },
            });
    }, [data,scope,yearsObject]);

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};
