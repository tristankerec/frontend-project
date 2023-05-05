import Image from 'next/image'
import { Inter } from 'next/font/google'
import { type } from 'os';
import path from 'path';
import Papa from "papaparse";
import React from 'react';
import L from 'leaflet';
import Map from './Map.jsx';
import dynamic from 'next/dynamic';
import LineGraph from './LineGraph.jsx';
import NewMap from './NewMap';

const inter = Inter({ subsets: ['latin'] })

const markersData = [
  { lat: 51.505, lng: -0.09 },
  { lat: 51.507, lng: -0.1 },
  { lat: 51.509, lng: -0.12 },
  { lat: 51.505, lng: -0.09 },
  { lat: 51.507, lng: -0.1 },
  { lat: 51.509, lng: -0.12 },
  { lat: 51.505, lng: -0.09 },
  { lat: 51.507, lng: -0.1 },
  { lat: 51.509, lng: -0.12 },
  { lat: 51.505, lng: -0.09 },
  { lat: 51.507, lng: -0.1 },
  { lat: 51.509, lng: -0.12 },
];


const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
});

export default function Home() {
  return (
      <div>
        <MapWithNoSSR/>
      </div>
  )
};