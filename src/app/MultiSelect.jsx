'use client';
import React, { useRef, useEffect, useState } from 'react';
import Select from 'react-select';

export default function MultiSelect({data, selectedLocation, selectedAsset, selectedCategory, handleLocationChange, handleAssetChange, handleCategoryChange}) {
    const locationSet = new Set(data.map(current => `${current.Lat},${current.Long}`));
    const locations = Array.from(locationSet).map(item => ({value: item, label: item}));
    const assetSet = new Set(data.map(current => `${current['Asset Name']}`));
    const assets = Array.from(assetSet).map(item => ({value: item, label: item}));
    const categorySet = new Set(data.map(current => `${current['Business Category']}`));
    const categories = Array.from(categorySet).map(item => ({value: item, label: item}));
    return (
        <div style={{alignItems:'center', margin :'0 50px', color: '#000'}}>
            <div style={{margin: '30px 0'}}>
                <h1 style={{ textAlign: 'left', paddingBottom: '10px', fontSize: '18px' }}>Select a Business Location</h1><Select
                    defaultValue={[]}
                    options={locations}
                    name="locations"
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder={'...'}
                    value={selectedLocation}
                    onChange={handleLocationChange}/>
            </div>
            <div style={{margin: '30px 0'}}>
                <h1 style={{ textAlign: 'left', paddingBottom: '10px', fontSize: '18px' }}>Select an Asset Name</h1><Select
                    defaultValue={[]}
                    options={assets}
                    name="assets"
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder={'...'}
                    value={selectedAsset}
                    onChange={handleAssetChange}/>
            </div>
            <div style={{margin: '30px 0'}}>
                <h1 style={{ textAlign: 'left', paddingBottom: '10px', fontSize: '18px' }}>Select a Business Category</h1><Select
                    defaultValue={[]}
                    options={categories}
                    name="categories"
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder={'...'}
                    value={selectedCategory}
                    onChange={handleCategoryChange}/>
            </div>
        </div>
    )

};