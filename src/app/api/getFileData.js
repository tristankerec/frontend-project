import path from 'path';
import Papa from "papaparse";
import fs from 'fs';

export default async function handler(req, res) {
    const csvFilePath = path.join(process.cwd(), 'public/mapData.csv');
    const csvFile = await fs.promises.readFile(csvFilePath, 'utf-8');
    const mapData = Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            var data = results.data;
            res.status(200).json({ data });
        }
    });
}