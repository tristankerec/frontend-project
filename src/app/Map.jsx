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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { FaceRetouchingNaturalTwoTone } from '@mui/icons-material';

function getCellColour(risk) {
    if (risk < .333) {
      return 'rgba(63, 195, 128, 0.9)';
    } else if (risk >= 0.666) {
      return 'rgba(242, 38, 19, 0.9)';
    } else {
      return 'rgba(248, 148, 6, 0.9)';
    }
}
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

const columns2 = [
  {
    width:'35%',
    label: 'Name',
    dataKey: 'name',
  },
  {
    width:'20%',
    label: 'Category',
    dataKey: 'category',
  },
  {
    width:'15%',
    label: 'Latitude',
    dataKey: 'latitude',
    numeric: true,
  },
  {
    width:'15%',
    label: 'Longitude',
    dataKey: 'longitude',
    numeric: true,
  },
  {
    width:'15%',
    label: 'Risk Rating',
    dataKey: 'riskrating',
  },
];

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns2.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}



function Row(_index, row) {
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
      ></IconButton>
      {columns2.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric || false ? 'right' : 'left'}
        >
          {row[column.dataKey]}
        </TableCell>
      ))}
    </React.Fragment>
  );
}

function ExpandableTableRow({ id, row, open, onRowClick, handleRowClick }) {

  const factorList = Object.entries(JSON.parse(row.riskfactors)).map(([key, value]) => (
    <li key={key}>
      <b>{key}: </b>
      {(value).toFixed(2)}
    </li>
  ));

  return (
    <React.Fragment>
      <TableRow 
        id={`row-${id}`}
        onClick={() => onRowClick(id)}
        style={{ cursor: 'pointer' }}
      >
      <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => handleRowClick(row.id)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {columns2.map((column) => (
          column.dataKey === 'riskrating' ? (
            <TableCell
              style={{color: 'white', backgroundColor: getCellColour(row[column.dataKey])}}
              key={column.dataKey}
              align={column.numeric || false ? 'right' : 'left'}
            >
              {row[column.dataKey]}
            </TableCell>
          ) : (
          <TableCell
            key={column.dataKey}
            align={column.numeric || false ? 'right' : 'left'}
          >
          {column.numeric ? parseFloat(row[column.dataKey]) : row[column.dataKey]}
          </TableCell>
        )
        ))}
      </TableRow>
      <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
            <Typography style={{fontWeight:'bold'}} variant="h5" gutterBottom component="div">
                {row.name}
              </Typography>
              <div style={{display:'flex', flexDirection:'row'}}>
              <div style={{paddingRight: '15rem'}}>
              
              <Typography  gutterBottom component="div">
                {row.category}
              </Typography>
              <Typography  gutterBottom component="div">
                {row.latitude},{row.longitude}
              </Typography>
              <Typography  gutterBottom component="div" style={{display: 'flex', alignItems: 'center'}}>
                Risk Rating: {row.riskrating}
                <div style={{width: '2.5vh', height: '2.5vh', borderRadius: '30%', backgroundColor: getCellColour(row.riskrating), marginLeft: '1rem'}}/>
              </Typography>
              </div>
              <div>
              <Typography style={{fontWeight:'bold'}} gutterBottom component="div">
                Risk Factors
              </Typography>
              <Typography gutterBottom component="div">
                {factorList}
              </Typography>
              </div>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function rowContent(_index, row) {
  const handleRowClick = () => {
    setExpanded(!expanded);
  };
  return (
    <React.Fragment>
  {columns2.map((column) => (
    column.dataKey === 'riskrating' ? (
      <TableCell
        style={{backgroundColor: getCellColour(row[column.dataKey])}}
        key={column.dataKey}
        align={column.numeric || false ? 'right' : 'left'}
      >
        {row[column.dataKey]}
      </TableCell>
    ) : (
      <TableCell
        key={column.dataKey}
        align={column.numeric || false ? 'right' : 'left'}
      >
        {row[column.dataKey]}
      </TableCell>
    )
  ))}
</React.Fragment>
  );
}

function createData(id, name, category, latitude, longitude, riskrating, riskfactors) {
  return { id, name, category, latitude, longitude, riskrating, riskfactors };
}

function ExpandableRow({ rowData }) {
  const [expanded, setExpanded] = useState(false);

  const handleRowClick = () => {
    setExpanded(!expanded);
  };

  return (
    <React.Fragment>
      <div onClick={handleRowClick} style={{ cursor: "pointer" }}>
        <span style={{ marginRight: "1rem" }}>{expanded ? "-" : "+"}</span>
        {rowData.name}
      </div>
      {expanded && (
        <div style={{ marginLeft: "1rem" }}>
          <div>Category: {rowData.category}</div>
          <div>Latitude: {rowData.latitude}</div>
          <div>Longitude: {rowData.longitude}</div>
          <div>Risk Rating: {rowData.riskrating}</div>
        </div>
      )}
    </React.Fragment>
  );
}

function Filters({ selectedCategories, selectedFactors, onFactorChange, onCategoryChange, newdata, filterText, onFilter, onClear }) {
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
      <div style={{ zIndex: '9999', color: '#000', paddingTop: '20px', paddingRight: '0px', display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px' }}>
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
}

function YearTable({ selectedCategories, selectedFactors, handleCategoriesChange, handleFactorChange, page, setPage, filterText, setFilterText, handleClear, setScrollToRow, scrollToRow, tableRef, data, selectedYear, selectedRow, setSelectedRow, handleMarkerClick, handleTableClick, selectedRowIndex}) {
  
  if (selectedYear) {
    const filteredData = data.filter(item => item.Year == selectedYear);
    const rows = Array.from(filteredData, (obj,index) => {
      return createData(index, obj['Asset Name'], obj['Business Category'], obj['Lat'], obj['Long'], obj['Risk Rating'], obj['Risk Factors'])
    });
    //console.log(rows);

    // const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleRowClick = (index) => {
      setSelectedRow(selectedRow === index ? null : index);
    };

    useEffect (() => {
        if (scrollToRow !== -1) {
          setSortBy('name');
          setSortOrder('asc');
          // console.log(rowsPerPage);
          // console.log(scrollToRow);
          const pageNumber = Math.floor((scrollToRow) / rowsPerPage);
          //console.log(pageNumber)
          if (pageNumber > 0) {
            setPage(pageNumber);
          } else {
            setPage(0);
          }
          
          // console.log(pageNumber)
          // console.log(page);
          var row = tableRef.current.querySelector(`#row-${scrollToRow}`);
          // console.log(scrollToRow)
          // console.log(row)
          // console.log(page);
          if (row) {
            //const pageNumber = Math.floor(scrollToRow / rowsPerPage);
            //setPage(2);
            setTimeout(() => {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            //handleMarkerClick(scrollToRow);
            //setSelectedRow(selectedRow === scrollToRow ? null : scrollToRow);
            //setSelectedRow(selectedRow === scrollToRow ? null : scrollToRow);
          }
        }
    },[scrollToRow]);

    useEffect(() => {
      var row = tableRef.current.querySelector(`#row-${scrollToRow}`);
        // console.log(scrollToRow)
        // console.log(row)
        //console.log(page);
        if (row) {
          //const pageNumber = Math.floor(scrollToRow / rowsPerPage);
          //setPage(2);
          setTimeout(() => {
            row.scrollIntoView({ behavior: 'smooth', block:'center'});
          }, 100);
          //handleMarkerClick(scrollToRow);
          //setSelectedRow(selectedRow === scrollToRow ? null : scrollToRow);
          //setSelectedRow(selectedRow === scrollToRow ? null : scrollToRow);
        } 
        setScrollToRow(-1);
    },[page])

    //console.log(rows);

    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSortRequest = (column) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(column);
        setSortOrder('asc');
      }
    };

    function descendingComparator(a, b, orderBy) {
      if (b[orderBy] === undefined) {
        return -1;
      }
      if (a[orderBy] === undefined) {
        return 1;
      }
      if (orderBy === 'name') {
        return b[orderBy].localeCompare(a[orderBy]);
      }
      if (orderBy === 'longitude' || orderBy === 'latitude' || orderBy =='riskrating') {
        if (b[orderBy] < 0 && a[orderBy] < 0) {
          if (a[orderBy] < b[orderBy]) {
            return 1;
          }
          if (a[orderBy] > b[orderBy]) {
            return -1;
          }
          return 0;
        }
        const aValue = Math.abs(parseFloat(a[orderBy]));
        const bValue = Math.abs(parseFloat(b[orderBy]));
        if (aValue < bValue) {
          return 1;
        }
        if (aValue > bValue) {
          return -1;
        }
        if (aValue === bValue) {
          if (parseFloat(a[orderBy]) < parseFloat(b[orderBy])) {
            return 1;
          }
          if (parseFloat(a[orderBy]) > parseFloat(b[orderBy])) {
            return -1;
          }
        }
        return 0;
      }
      
      if (b[orderBy] < 0) {
        return 1;
      }
      if (a[orderBy] < 0) {
        return -1;
      }
      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
      return 0;
    }
    
    function getComparator(order, orderBy) {
      return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
    }
    
    function stableSort(array, comparator) {
      const stabilizedThis = array.map((el, index) => [el, index]);
      stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
      });
      return stabilizedThis.map((el) => el[0]);
    }

    // const [filterText, setFilterText] = React.useState('');
    // const [selectedCategories, setSelectedCategories] = useState([]);
    // const [selectedFactors, setSelectedFactors] = useState([]);

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

    // const handleCategoryChange = (selectedOptions) => {
    //   setSelectedCategories(selectedOptions);
    //   if (selectedOptions.length == 0) {
    //     setPage(0);
    //   }
    // };
    
    // const handleFactorChange = (selectedOptions) => {
    //   setSelectedFactors(selectedOptions);
    //   if (selectedOptions.length == 0) {
    //     setPage(0);
    //   }
    // };

    // const handleClear = () => {
    //   if (filterText) {
    //     setPage(0);
    //     setFilterText('');
    //   }
    // }

    var filteredItems;
    if (selectedCategories.length === 0 && selectedFactors.length === 0) {
      filteredItems = rows;
    } else {
      filteredItems = rows.filter((item) => {
        const itemFactor = JSON.parse(item.riskfactors);
        const itemFactorKeys = Object.keys(itemFactor);
        const selectedFactorValues = selectedFactors.map((factor) => factor.value);
        return (
          (selectedCategories.length === 0 || selectedCategories.some((category) => category.value === item.category)) &&
          (selectedFactors.length === 0 || itemFactorKeys.some((key) => selectedFactorValues.includes(key)))
        );
      });
    }

    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
        <Typography style={{fontWeight: 'bold', fontSize: '35px', paddingBlock:'20px', paddingLeft:'15px' }}>
          Climate Risk Data for {selectedYear}
        </Typography>
        <div style={{zIndex: '1000', position:'relative', paddingLeft: '1rem' }}>
          <Filters selectedCategories={selectedCategories} selectedFactors={selectedFactors} onFactorChange={handleFactorChange} onCategoryChange={handleCategoriesChange} onClear={handleClear} filterText={filterText} newdata={newdata} />
        </div>
      <TableContainer component={Paper} sx={{position: 'relative', height: '700px', overflow: 'auto'}}>
        <Table ref={tableRef} aria-label="collapsible table">
          <TableHead sx={{ zIndex:'999', position: 'sticky', top: 0, background: 'white' }}>
            <TableRow>
              <TableCell/>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortOrder}
                  onClick={() => handleSortRequest('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'category'}
                  direction={sortOrder}
                  onClick={() => handleSortRequest('category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'latitude'}
                  direction={sortOrder}
                  onClick={() => handleSortRequest('latitude')}
                >
                  Latitude
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'longitude'}
                  direction={sortOrder}
                  onClick={() => handleSortRequest('longitude')}
                >
                  Longitude
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'riskrating'}
                  direction={sortOrder}
                  onClick={() => handleSortRequest('riskrating')}
                >
                  Risk Rating
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(filteredItems, getComparator(sortOrder, sortBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <ExpandableTableRow
                  id={row.id}
                  key={row.id}
                  row={row}
                  open={selectedRow === row.id}
                  handleRowClick={handleRowClick}
                  onRowClick={() => {
                    //handleRowClick(row.id);
                    handleTableClick(row);
                  }}
                />
            ))}
          </TableBody>
          <TableFooter sx={{ position: 'sticky', bottom: 0, background: 'white' }}>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                count={filteredItems.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => {
                  setPage(newPage);
                }}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      </Paper>
      </Box>
    );
  } else {
    return (
      <Paper style={{ height: '91vh', width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Select a Decade to display data</p>
      </Paper>
    );
    
  }

}

function DecadeTable({ selectedYear, handleRowClick, selectedRowIndex, mapRef }) {
  const tableRef = useRef(null);
  const [fileData, setfileData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);


  useEffect(() => {
    console.log("selectedRowIndex:", selectedRowIndex);
    if (selectedRowIndex !== -1 && tableRef.current !== null) {
      console.log('hh');
      const page = Math.floor(selectedRowIndex / tableRef.current.state.rowsPerPage);

      // Update the page state
      tableRef.current.setState({ currentPage: page });

      // Scroll to the row
      const rowElement = tableRef.current.base.querySelector(`[data-index="${selectedRowIndex}"]`);
      rowElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

  },[tableRef.current, selectedRowIndex]);

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
      <div style={{ zIndex: '9998', color: '#000', paddingTop: '0px', paddingRight: '0px', display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px' }}>
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
        title={selectedYear ? <p style={{ fontWeight: 'bold', fontSize: '35px', paddingTop:'10px' }}>
          Climate Risk Data for {selectedYear}
        </p> : null}
        highlightOnHover={true}
        expandableRows={true}
        expandableRowsComponent={ExpandableRowComponent}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        fixedHeaderScrollHeight='71vh'
        fixedHeader
        pointerOnHover={true}
        columns={columns}
        data={filteredItems}
        pagination
        paginationRowsPerPageOptions={[10,25,50]}
        paginationResetDefaultPage={resetPaginationToggle}
        onRowClicked={handleRowClick}
        ref={tableRef}
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

const createMap = (handleCategoriesChange, handleFactorChange, handleClear, setScrollToRow, handleMarkerClick, tableRef, mapRef, data, uniqueYears, markersLayers, setRow, setCenter, setHasSetCenter, setSelectedRowIndex, setSelectedAsset, setSelectedCategory, setSelectedLocation) => {
  const map = L.map(mapRef.current, {
      center: [43.6532, -79.3832],
      zoom: 8
  });

  // const scrollToRow = (index) => {
  //   const row = tableRef.current.querySelector(`#row-${index}`);
  //   if (row) {
  //     row.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

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

  uniqueYears.forEach((year) => {
    //markersLayers[year] = L.layerGroup().addTo(map);
    markersLayers[year] = new L.MarkerClusterGroup().addTo(map);
    map.removeLayer(markersLayers[year]);
    const filteredData = data.filter(item => item.Year == year);

    filteredData.forEach((item, index) => {
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
          //console.log(item);
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
          setSelectedRowIndex(index);
          setSelectedLocation('...');
          setSelectedCategory('...');
          setSelectedAsset('...');
          handleCategoriesChange([]);
          handleFactorChange([]);
          // handleClear();
          handleMarkerClick(index);
          setScrollToRow(index);
          
          
          
          
        });
    });

  });

  //console.log(markersLayers);

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
  
  const tableRef = useRef(null);
  const mapRef = useRef(null);

  const [scrollToRow, setScrollToRow] = useState(-1);

  const [selectedRow, setSelectedRow] = useState(null);

  const handleMarkerClick = (index) => {
    setSelectedRow(selectedRow === index ? null : index);
  };

  function handleTableClick(row) {
    setCenter([row.latitude,row.longitude]);
    setHasSetCenter(true);
    //console.log(row)
    setRow(row);
    setSelectedLocation('...');
    setSelectedAsset('...');
    setSelectedCategory('...');
    return null;
  }

  const [filterText, setFilterText] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFactors, setSelectedFactors] = useState([]);

  const handleClear = () => {
    if (filterText) {
      setPage(0);
      setFilterText('');
    }
  }

  const handleCategoriesChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
    if (selectedOptions.length == 0) {
      //setPage(0);
    }
  };
  
  const handleFactorChange = (selectedOptions) => {
    setSelectedFactors(selectedOptions);
    if (selectedOptions.length == 0) {
      //setPage(0);
    }
  };

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

  const markersLayers = {};
  const [mapContainer, setMapContainer] = useState(null);

  useEffect(() => {
    console.log(data);
    if (data.length > 0) {
        const map = createMap(handleCategoriesChange, handleFactorChange, handleClear, setScrollToRow, handleMarkerClick, tableRef, mapRef, data, uniqueYears, markersLayers, setRow, setCenter, setHasSetCenter, setSelectedRowIndex, setSelectedAsset, setSelectedCategory, setSelectedLocation);
        setMapContainer(map);
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
    
  }, [data,selectedYear]);

  useEffect(() => {
    if (mapContainer) {
      mapContainer.flyTo(center,14);
    }
  },[center]);

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
                      setPage(0);
                      //setRow(false);
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
    <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "row", height: "91vh", width: "99vw", paddingLeft:'2vh', paddingTop:'3vw'}}>
      <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", height: "91vh", width: "99vw"}}>
        <div ref={mapRef} style={{ flex: "1 1 50%", minWidth: "0", height: "100%"}}/>
        <div style={{padding:'.3rem'}}></div>
        <div style={{display: 'flex', alignItems:'center', justifyContent: 'center',background:'white'}}>
          <div><LineGraph data={data} uniqueYears={uniqueYears} scope={row} attributeAverages={averages} yearsForAverages={yearsForAverages} name={selectedName}/></div>
          <div><MultiSelect data={data} selectedLocation={selectedLocation} selectedAsset={selectedAsset} selectedCategory={selectedCategory} handleLocationChange={handleLocationChange} handleAssetChange={handleAssetChange} handleCategoryChange={handleCategoryChange}></MultiSelect></div>
        </div>
      </div>
      <div style={{ flex: "1 1 50%", minWidth: "0%", height: "50vh",paddingLeft: "1rem" }}>
        <YearTable selectedCategories={selectedCategories} selectedFactors={selectedFactors} handleCategoriesChange={handleCategoriesChange} handleFactorChange={handleFactorChange} page={page} setPage={setPage} filterText={filterText} setFilterText={setFilterText} handleClear={handleClear} setScrollToRow={setScrollToRow} scrollToRow={scrollToRow} tableRef={tableRef} data={data} selectedYear={selectedYear} selectedRow={selectedRow} setSelectedRow={setSelectedRow} handleMarkerClick={handleMarkerClick} handleTableClick={handleTableClick} selectedRowIndex={selectedRowIndex}></YearTable>
      </div>
    </div>

    </>
  );
}
