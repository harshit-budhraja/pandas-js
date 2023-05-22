const csv = require("csv-parser");
const csvWriter = require("csv-write-stream");
const jsonfile = require("jsonfile");
const fs = require("fs");

/**
 * Represents a DataFrame.
 * @class
 */
class DataFrame {
  /**
   * Creates an instance of DataFrame.
   * @constructor
   * @param {Array|Array[]} data - The data for the DataFrame.
   * @param {string[]} [columns] - The column names for the DataFrame.
   * @throws {Error} Invalid input data format.
   */
  constructor(data, columns) {
    if (Array.isArray(data[0])) {
      if (
        columns &&
        Array.isArray(columns) &&
        columns.length === data[0].length
      ) {
        this.columns = columns;
      } else {
        this.columns = Array.from(
          { length: data[0].length },
          (_, i) => `column${i + 1}`
        );
      }

      this.data = data.map((row) => {
        const obj = {};
        this.columns.forEach((column, index) => {
          obj[column] = row[index];
        });

        return obj;
      });
    } else if (Array.isArray(data)) {
      this.columns = data[0] ? Object.keys(data[0]) : columns;
      this.data = data;
    } else {
      throw new Error("Invalid input data format");
    }

    this.dtypes = this.#detectColumnTypes();
  }

  #getColumn(columnName) {
    return this.data.map((row) => row[columnName]);
  }

  /**
   * Returns the underlying data of the DataFrame.
   * @returns {Array} The data of the DataFrame.
   */
  getDataFrame() {
    return this.data;
  }

  /**
   * Returns a specific row of the DataFrame.
   * @param {number} index - The index of the row.
   * @returns {Object} The row at the specified index.
   */
  getRow(index) {
    if (index > this.data.length) {
      throw new Error("Index out of range");
    }

    return this.data[index];
  }

  /**
   * Prints the first n rows of the DataFrame.
   * @param {number} [n=5] - The number of rows to display.
   */
  head(n = 5) {
    const headData = this.data.slice(0, n);
    console.log(headData);

    return headData;
  }

  /**
   * Prints the last n rows of the DataFrame.
   * @param {number} [n=5] - The number of rows to display.
   */
  tail(n = 5) {
    const tailData = this.data.slice(-n);
    console.log(tailData);

    return tailData;
  }

  /**
   * Gets the shape of the DataFrame.
   * @type {string}
   * @readonly
   */
  get shape() {
    const rows = this.data.length;
    const columns = this.columns.length;

    return `(${rows}, ${columns})`;
  }

  #getColumnData(columnName) {
    if (!this.columns.includes(columnName)) {
      throw new Error("Column does not exist");
    }

    return this.data.map((row) => row[columnName]);
  }

  /**
   * Gets the values of a specific column.
   * @param {string} columnName - The name of the column.
   * @returns {Array} The values of the specified column.
   */
  get(columnName) {
    return this.#getColumnData(columnName);
  }

  #detectColumnType(columnName) {
    const columnData = this.#getColumn(columnName);
    const types = Array.from(new Set(columnData.map((value) => typeof value)));

    return types.length === 1 ? types[0] : "mixed";
  }

  #detectColumnTypes() {
    const dtypes = {};
    for (const columnName of this.columns) {
      dtypes[columnName] = this.#detectColumnType(columnName);
    }

    return dtypes;
  }

  /**
   * Renames the columns of the DataFrame.
   * @param {Object} columns - An object mapping old column names to new column names.
   */
  renameColumns(columns) {
    const newColumns = [];
    const newData = [];
    for (const oldColumn of this.columns) {
      const newColumn = columns[oldColumn] || oldColumn;
      newColumns.push(newColumn);
    }
    for (const row of this.data) {
      const newRow = {};
      for (const oldColumn of this.columns) {
        const newColumn = columns[oldColumn] || oldColumn;
        newRow[newColumn] = row[oldColumn];
      }
      newData.push(newRow);
    }
    this.columns = newColumns;
    this.data = newData;
    this.dtypes = this.#detectColumnTypes();
  }

  /**
   * Drops specified columns from the DataFrame.
   * @param {string|string[]} columns - The column(s) to drop.
   */
  dropColumns(columns) {
    const columnsToDrop = Array.isArray(columns) ? columns : [columns];
    const newColumns = this.columns.filter(
      (column) => !columnsToDrop.includes(column)
    );
    const newData = this.data.map((row) => {
      const newRow = {};
      for (const column of newColumns) {
        newRow[column] = row[column];
      }

      return newRow;
    });
    this.columns = newColumns;
    this.data = newData;
    this.dtypes = this.#detectColumnTypes();
  }

  /**
   * Selects specified columns from the DataFrame.
   * @param {string|string[]} columns - The column(s) to select.
   * @returns {DataFrame} A new DataFrame with the selected columns.
   */
  select(columns) {
    const columnsToSelect = Array.isArray(columns) ? columns : [columns];
    const newColumns = columnsToSelect.filter((column) =>
      this.columns.includes(column)
    );
    const newData = this.data.map((row) => {
      const newRow = {};
      for (const column of newColumns) {
        newRow[column] = row[column];
      }

      return newRow;
    });

    return new DataFrame(newData, newColumns);
  }

  /**
   * Filters the DataFrame based on a condition.
   * @param {Function} condition - The condition to filter rows.
   * @returns {DataFrame} A new DataFrame with filtered rows.
   */
  filter(condition) {
    const filteredData = this.data.filter((row) => condition(row));

    return new DataFrame(filteredData, this.columns);
  }

  /**
   * Sorts the DataFrame based on columns.
   * @param {string[]} columns - The column(s) to sort by.
   * @param {boolean} [ascending=true] - Whether to sort in ascending order.
   * @returns {DataFrame} A new DataFrame with sorted rows.
   */
  sortBy(columns, ascending = true) {
    const sortData = [...this.data];
    sortData.sort((row1, row2) => {
      for (const column of columns) {
        const value1 = row1[column];
        const value2 = row2[column];
        if (value1 < value2) {
          return ascending ? -1 : 1;
        } else if (value1 > value2) {
          return ascending ? 1 : -1;
        }
      }

      return 0;
    });

    return new DataFrame(sortData, this.columns);
  }

  /**
   * Groups the DataFrame by columns.
   * @param {string[]} columns - The column(s) to group by.
   * @returns {DataFrame} A new DataFrame with grouped rows.
   */
  groupBy(columns) {
    const groups = new Map();
    for (const row of this.data) {
      const key = JSON.stringify(columns.map((column) => row[column]));
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(row);
    }
    const groupData = Array.from(groups.values());

    return new DataFrame(groupData, this.columns);
  }

  /**
   * Aggregates column values using specified functions.
   * @param {Object} aggregations - An object mapping column names to aggregation functions.
   * @returns {Object} The aggregated values for each column.
   */
  aggregate(aggregations) {
    const aggregatedData = {};
    for (const columnName in aggregations) {
      const aggregationFn = aggregations[columnName];
      if (typeof aggregationFn === "function") {
        const columnData = this.#getColumn(columnName);
        aggregatedData[columnName] = aggregationFn(columnData);
      } else {
        throw new Error(
          `Invalid aggregation function for column '${columnName}'`
        );
      }
    }

    return aggregatedData;
  }

  /**
   * Calculates the mean of a numeric column.
   * @param {string} columnName - The name of the column.
   * @returns {number} The mean value of the column.
   */
  mean(columnName) {
    const columnData = this.#getColumn(columnName);
    const sum = columnData.reduce((acc, val) => acc + val, 0);

    return sum / columnData.length;
  }

  /**
   * Calculates the median of a numeric column.
   * @param {string} columnName - The name of the column.
   * @returns {number} The median value of the column.
   */
  median(columnName) {
    const columnData = this.#getColumn(columnName);
    const sortedData = columnData.sort((a, b) => a - b);
    const mid = Math.floor(sortedData.length / 2);
    if (sortedData.length % 2 === 0) {
      return (sortedData[mid - 1] + sortedData[mid]) / 2;
    } else {
      return sortedData[mid];
    }
  }

  /**
   * Calculates the mode of a column.
   * @param {string} columnName - The name of the column.
   * @returns {Array} The mode(s) of the column.
   */
  mode(columnName) {
    const columnData = this.#getColumn(columnName);
    const frequencyMap = {};
    let maxFrequency = 0;
    let modes = [];

    for (const value of columnData) {
      frequencyMap[value] = frequencyMap[value] + 1 || 1;
      if (frequencyMap[value] > maxFrequency) {
        maxFrequency = frequencyMap[value];
        modes = [value];
      } else if (frequencyMap[value] === maxFrequency) {
        modes.push(value);
      }
    }

    return modes;
  }

  /**
   * Calculates the standard deviation of a numeric column.
   * @param {string} columnName - The name of the column.
   * @returns {number} The standard deviation of the column.
   */
  std(columnName) {
    const columnData = this.#getColumn(columnName);
    const mean = this.mean(columnName);
    const sumSquaredDiff = columnData.reduce(
      (acc, val) => acc + Math.pow(val - mean, 2),
      0
    );
    const variance = sumSquaredDiff / columnData.length;

    return Math.sqrt(variance);
  }

  /**
   * Creates a DataFrame from a CSV file.
   * @static
   * @param {string} file - The path to the CSV file.
   * @returns {Promise<DataFrame>} A Promise that resolves to a DataFrame.
   */
  static fromCSV(file) {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(file)
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", () => {
          const columns = Object.keys(rows[0]);
          resolve(new DataFrame(rows, columns));
        })
        .on("error", reject);
    });
  }

  /**
   * Writes the DataFrame to a CSV file.
   * @param {string} file - The path to the output CSV file.
   * @returns {Promise<void>} A Promise that resolves when writing is complete.
   */
  toCSV(file) {
    return new Promise((resolve, reject) => {
      const writer = csvWriter({ headers: this.columns });
      const rows = this.data.map((row) => this.columns.map((col) => row[col]));
      writer.pipe(fs.createWriteStream(file));
      rows.forEach((row) => writer.write(row));
      writer.end();
      resolve();
    });
  }

  /**
   * Creates a DataFrame from a JSON file.
   * @static
   * @param {string} file - The path to the JSON file.
   * @returns {Promise<DataFrame>} A Promise that resolves to a DataFrame.
   */
  static fromJSON(file) {
    return new Promise((resolve, reject) => {
      jsonfile.readFile(file, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const columns = Object.keys(data[0]);
          resolve(new DataFrame(data, columns));
        }
      });
    });
  }

  /**
   * Writes the DataFrame to a JSON file.
   * @param {string} file - The path to the output JSON file.
   * @returns {Promise<void>} A Promise that resolves when writing is complete.
   */
  toJSON(file) {
    return new Promise((resolve, reject) => {
      jsonfile.writeFile(file, this.data, { spaces: 2 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = {
  DataFrame,
};
