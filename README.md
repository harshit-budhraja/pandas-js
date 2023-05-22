# pandas-js

**pandas-js** is a JavaScript library inspired by the popular Python library [pandas](https://pandas.pydata.org/). It provides a DataFrame class for data manipulation and analysis, allowing you to work with structured data in a tabular format. With pandas-js, you can perform various operations such as filtering, sorting, grouping, aggregation, and more on your data.

## Usage

To use **pandas-js**, require the library and create an instance of the `DataFrame` class. You can provide the data and column names (optional) during initialization.

```javascript
const { DataFrame } = require("./lib");

const data = [
  [1, "John", 25],
  [2, "Jane", 30],
  [3, "Sam", 28],
];

const columns = ["ID", "Name", "Age"];

const df = new DataFrame(data, columns);
```

## Class Reference

### DataFrame

Represents a DataFrame.

#### Constructor

Creates an instance of DataFrame.

```javascript
const df = new DataFrame(data, columns);
```

- `data` (Array|Array[]): The data for the DataFrame.
- `columns` (string[]) (optional): The column names for the DataFrame.

Throws:
- `Error`: Invalid input data format.

#### Methods

- `getDataFrame(): Array`: Returns the underlying data of the DataFrame.

- `getRow(index: number): Object`: Returns a specific row of the DataFrame.

- `head(n: number = 5): void`: Prints the first n rows of the DataFrame.

- `tail(n: number = 5): void`: Prints the last n rows of the DataFrame.

- `get shape: string`: Gets the shape of the DataFrame.

- `get(columnName: string): Array`: Gets the values of a specific column.

- `renameColumns(columns: Object): void`: Renames the columns of the DataFrame.

- `dropColumns(columns: string|string[]): void`: Drops specified columns from the DataFrame.

- `select(columns: string|string[]): DataFrame`: Selects specified columns from the DataFrame.

- `filter(condition: Function): DataFrame`: Filters the DataFrame based on a condition.

- `sortBy(columns: string[], ascending: boolean = true): DataFrame`: Sorts the DataFrame based on columns.

- `groupBy(columns: string[]): DataFrame`: Groups the DataFrame by columns.

- `aggregate(aggregations: Object): Object`: Aggregates column values using specified functions.

- `mean(columnName: string): number`: Calculates the mean of a numeric column.

- `median(columnName: string): number`: Calculates the median of a numeric column.

- `mode(columnName: string): Array`: Calculates the mode(s) of a column.

- `std(columnName: string): number`: Calculates the standard deviation of a numeric column.

#### Static Methods

- `fromCSV(file: string): Promise<DataFrame>`: Creates a DataFrame from a CSV file.

- `fromJSON(file: string): Promise<DataFrame>`: Creates a DataFrame from a JSON file.

#### Instance Methods

- `toCSV(file: string): Promise<void>`: Writes the DataFrame to a CSV file.

- `toJSON(file: string): Promise<void>`: Writes the DataFrame to a JSON file.

## Examples

### Creating a DataFrame

```javascript
const { DataFrame } = require("./lib");

const data = [
  [1, "John", 25],
  [2, "Jane", 30],
  [3, "Sam", 28],
];

const columns = ["ID", "Name", "Age"];

const df = new DataFrame(data, columns);
```

In the code above, we create a new instance of the `DataFrame` class using the provided data and column names. This creates a DataFrame object `df` with three columns ("ID", "Name", and "Age") and three rows of data.

### Accessing Data

You can access the underlying data of the DataFrame using the `getDataFrame()` method. It returns the data as a two-dimensional array.

```javascript
const data = df.getDataFrame();
console.log(data);
```

Output:
```
[
  [1, "John", 25],
  [2, "Jane", 30],
  [3, "Sam", 28]
]
```

To access a specific row of the DataFrame, you can use the `getRow(index)` method. It returns the row as an object.

```javascript
const row = df.getRow(1);
console.log(row);
```

Output:
```
{ ID: 2, Name: "Jane", Age: 30 }
```

### Basic Operations

#### Head and Tail

You can print the first few rows of the DataFrame using the `head(n)` method. By default, it prints the first 5 rows.

```javascript
df.head();
```

Output:
```
   ID  Name  Age
0   1  John   25
1   2  Jane   30
2   3   Sam   28
```

Similarly, you can print the last few rows of the DataFrame using the `tail(n)` method.

```javascript
df.tail(2);
```

Output:
```
   ID  Name  Age
1   2  Jane   30
2   3   Sam   28
```

#### Shape

You can get the shape of the DataFrame (number of rows and columns) using the `shape` property.

```javascript
const shape = df.shape;
console.log(shape);
```

Output:
```
(3, 3) # (rows, columns)
```

#### Column Access

You can get the values of a specific column using the `get(columnName)` method. It returns the column values as an array.

```javascript
const ageColumn = df.get("Age");
console.log(ageColumn);
```

Output:
```
[25, 30, 28]
```

#### Renaming Columns

You can rename the columns of the DataFrame using the `renameColumns(columns)` method. Pass an object with the current column names as keys and the new column names as values.

```javascript
df.renameColumns({ "ID": "IDNumber", "Name": "FullName" });
df.head();
```

Output:
```
   IDNumber FullName  Age
0         1     John   25
1         2     Jane   30
2         3      Sam   28
```

#### Dropping Columns

You can drop specific columns from the DataFrame using the `dropColumns(columns)` method. Pass either a single column name or an array of column names.

```javascript
df.dropColumns("Age");
df.head();
```

Output:
```
   IDNumber FullName
0         1     John
1         2     Jane
2         3      Sam
```

#### Selecting Columns

You can select specific columns from the DataFrame using the `select(columns)` method. Pass either a single column name or an array of column names.

```javascript
const selectedDF = df.select(["IDNumber", "FullName"]);
selectedDF.head();
```



Output:
```
   IDNumber FullName
0         1     John
1         2     Jane
2         3      Sam
```