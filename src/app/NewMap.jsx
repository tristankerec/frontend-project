'use client';
import React from 'react';
import Select from 'react-select'
import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, Popup, Tooltip } from 'react-leaflet';
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import L from 'leaflet';
import DataTable from 'react-data-table-component';
import LineGraph from './LineGraph.jsx';
import MultiSelect from './MultiSelect.jsx';
import NewMap from './NewMap';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';
import OMS from 'overlapping-marker-spiderfier-leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const columns = [
    {
        name: 'Name',
        selector: row => row.name,
        sortable: true,
        grow: 2.2,
    },
    {
      name: 'Category',
      selector: row => row.category,
      sortable: true,
  },
    {
        name: 'Latitude',
        selector: row => row.latitude,
        sortable: true,
    },
    {
      name: 'Longitude',
      selector: row => row.longitude,
      sortable: true,
  },

  {
    name: 'Risk Rating',
    selector: row => row.risk,
    sortable: true,
    conditionalCellStyles: [
      {
          when: row => row.risk < .333,
          style: {
              backgroundColor: 'rgba(63, 195, 128, 0.9)',
              color: 'white',
              '&:hover': {
                  cursor: 'pointer',
              },
          },
      },
      {
          when: row => row.risk >= .333 && row.risk < .666,
          style: {
              backgroundColor: 'rgba(248, 148, 6, 0.9)',
              color: 'white',
              '&:hover': {
                  cursor: 'pointer',
              },
          },
      },
      {
          when: row => row.risk >= .666,
          style: {
              backgroundColor: 'rgba(242, 38, 19, 0.9)',
              color: 'white',
              '&:hover': {
                  cursor: 'not-allowed',
              },
          },
      },
    ],
  },
  ];

function DecadeTable({ selectedYear, handleRowClick, selectedRowIndex }) {
  const tableRef = useRef(null);
  const [fileData, setfileData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/getFileData');
      const json = await response.json();
      setfileData(json.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (fileData) {
      const filteredData = fileData.filter(item => item.Year == selectedYear);
      setFilteredData(filteredData);
    }
  }, [fileData, selectedYear]);

  let newdata = [];
  if (selectedYear != null) {
    filteredData.map((item, index) => {
      var curData = {
        id: index+1,
        name: item['Asset Name'],
        latitude: item.Lat,
        longitude: item.Long,
        category: item['Business Category'],
        risk: item['Risk Rating'],
        factors: item['Risk Factors'],
        year: item['Year']
      };
      newdata.push(curData);
    });
  }

  const ExpandableRowComponent = (newdata) => {
    const factorList = Object.entries(JSON.parse(newdata.data.factors)).map(([key, value]) => (
      <li key={key}>
        <b>{key}: </b>
        {(value).toFixed(2)}
      </li>
    ));
    return (
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '60px' }}>
        <div>
          <h1 style={{ fontSize: '24px' }}><b>{newdata.data.name}</b></h1>
          <p>{newdata.data.category}</p>
          <p>Risk Rating: {newdata.data.risk}</p>
          <p>{newdata.data.latitude + ", " + newdata.data.longitude}</p>
        </div>
        <div>
          <h1 style={{ fontSize: '20px' }}><b>Risk Factors</b></h1>
          <ul>{factorList}</ul>
        </div>
      </div>
    );
  };

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFactors, setSelectedFactors] = useState([]);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
    if (selectedOptions.length == 0) {
      setResetPaginationToggle(!resetPaginationToggle);
    }
  };
  
  const handleFactorChange = (selectedOptions) => {
    setSelectedFactors(selectedOptions);
    if (selectedOptions.length == 0) {
      setResetPaginationToggle(!resetPaginationToggle);
    }
  };

  const FilterComponent = ( { onFactorChange, onCategoryChange, newdata, filterText, onFilter, onClear } ) => {
    
    const uniqueKeys = new Set();
    const uniqueCategories = new Set(newdata.map(item => item.category));
    const parsedData = newdata.map(obj => JSON.parse(obj.factors));
    for (let i = 0; i < parsedData.length; i++) {
      const keys = Object.keys(parsedData[i]);
      for (let j = 0; j < keys.length; j++) {
        uniqueKeys.add(keys[j]);
      }
    }
    const riskFactors = Array.from(uniqueKeys).map(item => ({ value: item, label: item }));
    const businessCategories = Array.from(uniqueCategories).map(item => ({ value: item, label: item }));

    return (
      newdata.length > 0 && (
      <div style={{ zIndex: '9998', color: '#000', paddingTop: '10px',paddingRight: '10px', display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '30px' }}>
          <h1 style={{textAlign:'left', paddingBottom:'10px', fontSize:'14px'}}>Filter Business Categories</h1>
          <Select
            defaultValue={[]}
            options={businessCategories}
            isMulti
            name="factors"
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder={'Select a Category'}
            value={selectedCategories}
            onChange={onCategoryChange}
            
          />
        </div>
        <div>
          <h1 style={{textAlign:'left', paddingBottom:'10px' , fontSize:'14px'}}>Filter Risk Factors</h1>
          <Select
            defaultValue={[]}
            options={riskFactors}
            isMulti
            name="factors"
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder={'Select a Risk Factor'}
            value={selectedFactors}
            onChange={onFactorChange}
          />
        </div>
      </div>
      )
    );
  };

  const [filterText, setFilterText] = React.useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  var filteredItems;
  if (selectedCategories.length === 0 && selectedFactors.length === 0) {
    filteredItems = newdata;
  } else {
    filteredItems = newdata.filter((item) => {
      const itemFactor = JSON.parse(item.factors);
      const itemFactorKeys = Object.keys(itemFactor);
      const selectedFactorValues = selectedFactors.map((factor) => factor.value);
      return (
        (selectedCategories.length === 0 || selectedCategories.some((category) => category.value === item.category)) &&
        (selectedFactors.length === 0 || itemFactorKeys.some((key) => selectedFactorValues.includes(key)))
      );
    });
  }
  
  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };
    return (
      <FilterComponent selectedCategories={selectedCategories} onFactorChange={handleFactorChange} onCategoryChange={handleCategoryChange} onClear={handleClear} filterText={filterText} newdata={newdata} />
    );
  }, [filterText, resetPaginationToggle, newdata]);

  return (
    <>
      <DataTable
        title={selectedYear ? <h1 style={{ fontWeight: 'bold', fontSize: '35px', paddingTop:'10px' }}>
          Climate Risk Data for {selectedYear}
        </h1> : null}
        highlightOnHover={true}
        expandableRows={true}
        expandableRowsComponent={ExpandableRowComponent}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        fixedHeaderScrollHeight='63vh'
        fixedHeader
        pointerOnHover={true}
        columns={columns}
        data={filteredItems}
        pagination
        paginationRowsPerPageOptions={[10,25,50]}
        paginationResetDefaultPage={resetPaginationToggle}
        onRowClicked={handleRowClick}
      />
    </>
  );
};

function getMarkerIcon(value) {
  if (value < 0.334) {
    return 'marker-green.png';
  } else if (value > 0.666) {
    return 'marker.png';
  } else {
    return 'marker-yellow.png';
  }
}

const createMap = (mapRef, data, uniqueYears, markersLayers) => {
  const map = L.map(mapRef.current, {
      center: [43.6532, -79.3832],
      zoom: 8
  });

  const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
          attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
      }
  ).addTo(map);

  const omsInstance = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true });

  //var markers = {};

  uniqueYears.forEach((year) => {
      //markersLayers[year] = L.layerGroup().addTo(map);
      markersLayers[year] = new L.MarkerClusterGroup().addTo(map);
      map.removeLayer(markersLayers[year]);
  });

  //console.log(markersLayers);

  data.forEach((item) => {
      var markerIcon = L.icon({
          iconUrl: getMarkerIcon(item['Risk Rating']),
          iconSize: [32, 32],
          iconAnchor: [16, 32]
      });
      //const marker = L.marker([item.Lat, item.Long], { icon: markerIcon}).addTo(markersLayers[item.Year]);
      const marker = L.marker([item.Lat, item.Long], { icon: markerIcon});
      markersLayers[item.Year].addLayer(marker);
      marker.bindTooltip(`<div><b>${item["Asset Name"]}</b></div><div>Category: ${item["Business Category"]}</div>`);
      marker.addEventListener('click', (event) => {
        console.log(item);
      });
      //omsInstance.addMarker(marker);
  });

  //map.addLayer(markers);
  //console.log(markers);
  console.log(markersLayers);

  // omsInstance.addListener('click', (marker) => {
  //     console.log('hi');
  // });

  //L.control.layers(null, markersLayers).addTo(map);

  // useEffect(() => {
  //   var activeLayers = [];
  //   map.eachLayer(function(layer) {
  //     if (layer instanceof L.Marker) {
  //       if (map.hasLayer(layer)) {
  //         activeLayers.push(layer);
  //       }
  //     }
  //   });
  //   console.log(activeLayers);

  // }, [map, mapRef, selectedYear]);


  return map;
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Markers({setRow, selectedYear, row, setSelectedRowIndex, setCenter, setHasSetCenter}) {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/getFileData');
      const json = await response.json();
      setData(json.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(item => item.Year == selectedYear);
      setFilteredData(filteredData);
      
    }
  }, [data, selectedYear]);
  return (
    <>
      {filteredData.map((item, index) => {
        var markerIcon = L.icon({
          iconUrl: getMarkerIcon(item['Risk Rating']),
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        if (row && (row.latitude == item.Lat && row.longitude == item.Long &&  row.name == item['Asset Name'] && row.category == item['Business Category'] && row.risk == item['Risk Rating'])) {
          return (
            <Marker
            eventHandlers={{
              click: () => {
                const itemObj = {
                  id: index+1,
                  name: item['Asset Name'],
                  latitude: item['Lat'],
                  longitude: item['Long'],
                  category: item['Business Category'],
                  risk: item['Risk Rating'],
                  factors: item['Risk Factors'],
                  year: item['Year']
                };
                console.log(itemObj)
                setRow(itemObj);
                setCenter([item['Lat'],item['Long']]);
                setHasSetCenter(true);
                setSelectedRowIndex(index)
              }
            }}
            key={index}
            position={[item.Lat, item.Long]} icon={markerIcon} zIndexOffset={999}>
              <Tooltip><b>{`${item["Asset Name"]}`}</b><br/>{`Category: ${item["Business Category"]}`}</Tooltip>
            </Marker>
          );
        } else {
          return (
            <Marker
            eventHandlers={{
              click: () => {
                const itemObj = {
                  id: index+1,
                  name: item['Asset Name'],
                  latitude: item['Lat'],
                  longitude: item['Long'],
                  category: item['Business Category'],
                  risk: item['Risk Rating'],
                  factors: item['Risk Factors'],
                  year: item['Year']
                };
                setRow(itemObj);
                setCenter([item['Lat'],item['Long']]);
                setHasSetCenter(true);
                setSelectedRowIndex(index)
              }
            }}
            key={index}
            position={[item.Lat, item.Long]} icon={markerIcon} zIndexOffset={1}>
              <Tooltip><b>{`${item["Asset Name"]}`}</b><br/>{`Category: ${item["Business Category"]}`}</Tooltip>
            </Marker>
          );
        }
      })}
    </>
  );
  
}

export function ChangeView ({center, hasSetCenter}) {
  const map = useMap();
  const currentCoords = map.getCenter();
  if (hasSetCenter) {
    map.flyTo(center, 14);
  }

  return null;
}


export function UpdateView({ coords, selectedYear }) {
  const map = useMap();
  map.setView(coords);
  const markersRef = useRef(L.layerGroup().addTo(map));
  const [data, setData] = useState(null);
  console.log(markersRef);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/getFileData');
      const json = await response.json();
      setData(json.data);
    };
    fetchData();

    var popup = L.popup();
    function onMapClick(e) {
      popup
          .setLatLng(e.latlng)
          .setContent("You clicked the map at " + e.latlng.toString())
          .openOn(map);
      console.log('click');
    }
    map.on('click', onMapClick);
  }, []);

  useEffect(() => {
    if (data) {
      const markers = [];
      const markersLayer = L.layerGroup();
      const filteredData = data.filter(item => item.Year == selectedYear);
      filteredData.map((item) => {
        const marker = L.marker([item.Lat,item.Long], {
          icon: L.icon({
            iconUrl: getMarkerIcon(item['Risk Rating']),
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          }),
          //title: item["Asset Name"] +"\n" + "("+item["Business Category"]+")",
          //draggable: false,
        }).bindPopup(`<b>${item["Asset Name"]}</b><br>Category: ${item["Business Category"]}<br>Year: ${item["Year"]}`);
        markers.push(marker);
        //console.log(marker);
      });
      markersLayer.addLayer(L.layerGroup(markers));
      markersLayer.addTo(map);
      console.log(markersLayer);

    }
  }, [data, selectedYear]);

  return null;
}

export default function Map() {
  
  const [uniqueYears, setUniqueYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [center, setCenter] = useState([43.6532, -79.3832]);
  const [hasSetCenter, setHasSetCenter] = useState(false);
  const [row, setRow] = useState(false);
  const [data,setData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [averages, setAverages] = useState([]);
  const [yearsForAverages, setYearsForAverages] = useState([]);
  const [selectedName, setSelectedName] = useState([]);
  const mapRef = useRef(null);

  function handleRowClick(row) {
    setCenter([row.latitude,row.longitude]);
    setHasSetCenter(true);
    console.log(row)

    setRow(row);
    setSelectedLocation('...');
    setSelectedAsset('...');
    setSelectedCategory('...');
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/getFileData');
      const json = await response.json();
      const data = json.data.sort((a,b) => a.Year - b.Year);
      setData(data);
      const uniqueYears = [...new Set(data.map((item) => item.Year))];
      setUniqueYears(uniqueYears);
    };
    fetchData();
  },[]);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedAsset('...');
    setSelectedCategory('...');
    const filteredData = data.filter(item => `${item.Lat},${item.Long}` == location.value);
    const locationAveragesByYear = Object.values(
      filteredData.reduce((result, item) => {
          const year = item.Year;
          if (!result[year]) {
              result[year] = { sum: 0, count: 0 };
          }
          result[year].sum += parseFloat(item["Risk Rating"]);
          result[year].count++;
          return result;
      }, {})
    );
    const roundedAverages = locationAveragesByYear.map((item) =>
      parseFloat((item.sum/item.count).toFixed(3))
    );
    const yearsForAverages = new Set(filteredData.map(current => `${current['Year']}`));
    setAverages(roundedAverages);
    setYearsForAverages(yearsForAverages);
    setSelectedName(location.value);
  };
  const handleAssetChange = (asset) => {
    setSelectedAsset(asset);
    setSelectedLocation('...');
    setSelectedCategory('...');
    const filteredData = data.filter(item => item['Asset Name'] == asset.value);
    const assetAveragesByYear = Object.values(
      filteredData.reduce((result, item) => {
          const year = item.Year;
          if (!result[year]) {
              result[year] = { sum: 0, count: 0 };
          }
          result[year].sum += parseFloat(item["Risk Rating"]);
          result[year].count++;
          return result;
      }, {})
    );
    const roundedAverages = assetAveragesByYear.map((item) =>
      parseFloat((item.sum/item.count).toFixed(3))
    );
    const yearsForAverages = new Set(filteredData.map(current => `${current['Year']}`));
    setAverages(roundedAverages);
    setYearsForAverages(yearsForAverages);
    setSelectedName(asset.value);
  };
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedLocation('...');
    setSelectedAsset('...');
    const filteredData = data.filter(item => item['Business Category'] == category.value);
    const categoryAveragesByYear = Object.values(
      filteredData.reduce((result, item) => {
          const year = item.Year;
          if (!result[year]) {
              result[year] = { sum: 0, count: 0 };
          }
          result[year].sum += parseFloat(item["Risk Rating"]);
          result[year].count++;
          return result;
      }, {})
    );
    const roundedAverages = categoryAveragesByYear.map((item) =>
      parseFloat((item.sum/item.count).toFixed(3))
    );
    const yearsForAverages = new Set(filteredData.map(current => `${current['Year']}`));
    setAverages(roundedAverages);
    setYearsForAverages(yearsForAverages);
    setSelectedName(category.value);
  };

  const markersLayers = {};

  useEffect(() => {
    if (data.length > 0) {
        const map = createMap(mapRef, data, uniqueYears, markersLayers);
        var activeLayers = [];
        console.log(markersLayers)
        map.eachLayer(function(layer) {
          if (layer instanceof L.Marker) {
            if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          }
        });
        if (selectedYear) {
          map.addLayer(markersLayers[selectedYear])
        }
        return () => {
            map.remove();
        };
    }
  }, [data, mapRef, uniqueYears, selectedYear, markersLayers]);

  return (
    <>
    <div style={{ zIndex:"9999"}} className="absolute top-2.5 right-4">
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        {selectedYear ? (
        <p>Viewing Decade: {selectedYear}</p>
        ) : (
          <p>Select a decade</p>
        )}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
          {uniqueYears.map((option) => (
              <Menu.Item key={uniqueYears.indexOf(option)}>
                {({ active }) => (
                  <a
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                    onClick={() => {
                      setSelectedYear(option);
                      setHasSetCenter(false);
                      setRow(false);
                    }}
                  >
                    {option}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
    </div>
    
    <div style={{ display: "flex", flexDirection: "row", height: "90vh", width: "99vw", paddingLeft:'2vh', paddingTop:'3vw' }}>
      <div ref={mapRef} style={{ flex: "1 1 50%", minWidth: "0", height: "100%" }} />
      {/* <div style={{ flex: "1 1 50%", minWidth: "0", height: "100%" }}>
        <NewMap markersData={data}></NewMap>
      </div> */}
      
      <div style={{ flex: "1 1 50%", minWidth: "0%", height: "100%",paddingInline: "1rem" }}>
        <DecadeTable selectedYear={selectedYear} handleRowClick={handleRowClick} selectedRowIndex={selectedRowIndex} />
      </div>
    </div>
    <div style={{display: 'flex', alignItems:'center', justifyContent: 'center', paddingTop:'100px',paddingBottom:'100px'}}>
      <div><LineGraph data={data} uniqueYears={uniqueYears} scope={row} attributeAverages={averages} yearsForAverages={yearsForAverages} name={selectedName}/></div>
      <div><MultiSelect data={data} selectedLocation={selectedLocation} selectedAsset={selectedAsset} selectedCategory={selectedCategory} handleLocationChange={handleLocationChange} handleAssetChange={handleAssetChange} handleCategoryChange={handleCategoryChange}></MultiSelect></div>
    </div>
    </>
  );
}



      // <MapContainer
      //   center={center}
      //   zoom={8}
      //   style={{ flex: "1 1 50%", minWidth: "0", height: "100%" }}
      // >
      //   <TileLayer
      //     attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      //     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      //   />
      //   <Markers setCenter={setCenter} setHasSetCenter={setHasSetCenter} setRow={setRow}selectedYear={selectedYear} row={row} setSelectedRowIndex={setSelectedRowIndex} />
      //   <ChangeView center={center} hasSetCenter={hasSetCenter}/>
      // </MapContainer>