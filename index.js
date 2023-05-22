const { DataFrame } = require("./lib");

async function driver() {
  // Example data
  const data = [
    [1, "John", 25],
    [2, "Jane", 30],
    [3, "Bob", 35],
    [4, "Alice", 28],
    [5, "Eve", 32],
  ];

  // Create a DataFrame
  const df = new DataFrame(data, ["ID", "Name", "Age"]);

  // Get the underlying data
  console.log("DataFrame data:", df.getDataFrame());

  // Get a specific row
  console.log("Row at index 2:", df.getRow(2));

  // Display the first 3 rows
  df.head(3);

  // Display the last 2 rows
  df.tail(2);

  // Get the shape of the DataFrame
  console.log("DataFrame shape:", df.shape);

  // Get values of a specific column
  console.log('Values of the "Name" column:', df.get("Name"));

  // Rename columns
  df.renameColumns({ ID: "Identifier", Age: "Years" });

  // Drop specified columns
  df.dropColumns(["Name"]);

  // Select specific columns
  const selectedDf = df.select(["Identifier", "Years"]);
  console.log("Selected DataFrame:", selectedDf.getDataFrame());

  // Filter the DataFrame
  const filteredDf = df.filter((row) => row["Years"] > 30);
  console.log("Filtered DataFrame:", filteredDf.getDataFrame());

  // Sort the DataFrame
  const sortedDf = df.sortBy(["Years"]);
  console.log("Sorted DataFrame:", sortedDf.getDataFrame());

  // Group the DataFrame
  const groupedDf = df.groupBy(["Years"]);
  console.log("Grouped DataFrame:", groupedDf.getDataFrame());

  // Aggregate column values
  const aggregations = {
    Years: (columnData) => Math.max(...columnData),
  };
  const aggregatedValues = df.aggregate(aggregations);
  console.log("Aggregated values:", aggregatedValues);

  // Calculate mean of a column
  const meanAge = df.mean("Years");
  console.log("Mean Age:", meanAge);

  // Calculate median of a column
  const medianAge = df.median("Years");
  console.log("Median Age:", medianAge);

  // Calculate mode of a column
  const modes = df.mode("Years");
  console.log("Modes of Age:", modes);

  // Calculate standard deviation of a column
  const stdDeviation = df.std("Years");
  console.log("Standard Deviation:", stdDeviation);

  // Create a DataFrame from a CSV file
  // const csvDf = await DataFrame.fromCSV("data.csv");
  // console.log("DataFrame from CSV:", csvDf.getDataFrame());

  // Write the DataFrame to a CSV file
  await df.toCSV("output.csv");
  console.log("DataFrame written to CSV.");

  // Create a DataFrame from a JSON file
  // const jsonDf = await DataFrame.fromJSON("data.json");
  // console.log("DataFrame from JSON:", jsonDf.getDataFrame());

  // Write the DataFrame to a JSON file
  await df.toJSON("output.json");
  console.log("DataFrame written to JSON.");
}

driver().catch(console.error);
