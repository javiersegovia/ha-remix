import { parse } from 'csv-parse/sync'

export const parseCSV = (csvString: string) =>
  parse(csvString, {
    columns: true,
    skipEmptyLines: true,
    delimiter: [';', ','],
  })
