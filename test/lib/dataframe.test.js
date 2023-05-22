const { expect } = require("chai");
const sinon = require("sinon");
const { DataFrame } = require("../../lib");

describe("DataFrame", () => {
  let df;
  let data;

  beforeEach(() => {
    data = [
      [1, "John", 25],
      [2, "Jane", 30],
      [3, "Sam", 28],
    ];
    const columns = ["ID", "Name", "Age"];
    df = new DataFrame(data, columns);
  });

  describe("getDataFrame", () => {
    it("should return the dataframe", () => {
      const data = df.getDataFrame();
      expect(data).to.eql([
        { ID: 1, Name: "John", Age: 25 },
        { ID: 2, Name: "Jane", Age: 30 },
        { ID: 3, Name: "Sam", Age: 28 },
      ]);
    });
  });

  describe("getRow", () => {
    it("should return the specified row as an object", () => {
      const row = df.getRow(1);
      expect(row).to.deep.equal({ ID: 2, Name: "Jane", Age: 30 });
    });

    it("should throw an error if the index is out of range", () => {
      expect(() => df.getRow(4)).to.throw("Index out of range");
    });
  });

  describe("head", () => {
    it("should print the first few rows of the DataFrame", () => {
      const consoleLogStub = sinon.stub(console, "log");
      const headData = df.head();
      expect(consoleLogStub.callCount).to.equal(1);
      expect(headData).to.eql([
        { ID: 1, Name: "John", Age: 25 },
        { ID: 2, Name: "Jane", Age: 30 },
        { ID: 3, Name: "Sam", Age: 28 },
      ]);

      consoleLogStub.restore();
    });
  });

  describe("tail", () => {
    it("should print the last few rows of the DataFrame", () => {
      const consoleLogStub = sinon.stub(console, "log");
      const tailData = df.tail(2);
      expect(consoleLogStub.callCount).to.equal(1);
      expect(tailData).to.eql([
        { ID: 2, Name: "Jane", Age: 30 },
        { ID: 3, Name: "Sam", Age: 28 },
      ]);

      consoleLogStub.restore();
    });
  });

  describe("shape", () => {
    it("should return the shape of the DataFrame", () => {
      const shape = df.shape;
      expect(shape).to.equal("(3, 3)");
    });
  });

  describe("get", () => {
    it("should return the values of the specified column", () => {
      let ageColumn = df.get("Age");
      expect(ageColumn).to.deep.equal([25, 30, 28]);
    });

    it("should throw an error if the column name does not exist", () => {
      expect(() => df.get("Salary")).to.throw("Column does not exist");
    });
  });

  describe("renameColumns", () => {
    it("should rename the specified columns", () => {
      df.renameColumns({ ID: "IDNumber", Name: "FullName" });
      const data = df.getDataFrame();
      expect(data).to.deep.equal([
        { IDNumber: 1, FullName: "John", Age: 25 },
        { IDNumber: 2, FullName: "Jane", Age: 30 },
        { IDNumber: 3, FullName: "Sam", Age: 28 },
      ]);
      expect(df.columns).to.deep.equal(["IDNumber", "FullName", "Age"]);
    });
  });

  describe("dropColumns", () => {
    it("should drop specified columns from the DataFrame", () => {
      df.dropColumns(["ID", "Age"]);
      expect(df.columns).to.deep.equal(["Name"]);
      expect(df.data).to.deep.equal([
        { Name: "John" },
        { Name: "Jane" },
        { Name: "Sam" },
      ]);
    });

    it("should drop a single specified column from the DataFrame", () => {
      df.dropColumns("ID");
      expect(df.columns).to.deep.equal(["Name", "Age"]);
      expect(df.data).to.deep.equal([
        { Name: "John", Age: 25 },
        { Name: "Jane", Age: 30 },
        { Name: "Sam", Age: 28 },
      ]);
    });
  });

  describe("select", () => {
    it("should select specified columns and return a new DataFrame", () => {
      const selected = df.select(["ID", "Age"]);
      expect(selected.columns).to.deep.equal(["ID", "Age"]);
      expect(selected.data).to.deep.equal([
        { ID: 1, Age: 25 },
        { ID: 2, Age: 30 },
        { ID: 3, Age: 28 },
      ]);
    });

    it("should select a single specified column and return a new DataFrame", () => {
      const selected = df.select("Name");
      expect(selected.columns).to.deep.equal(["Name"]);
      expect(selected.data).to.deep.equal([
        { Name: "John" },
        { Name: "Jane" },
        { Name: "Sam" },
      ]);
    });

    it("should not include columns that do not exist", () => {
      const selected = df.select(["ID", "Salary"]);
      expect(selected.columns).to.deep.equal(["ID"]);
      expect(selected.data).to.deep.equal([{ ID: 1 }, { ID: 2 }, { ID: 3 }]);
    });
  });

  describe("filter", () => {
    it("should filter the DataFrame based on a condition", () => {
      const filtered = df.filter((row) => row.Age > 25);
      expect(filtered.columns).to.deep.equal(["ID", "Name", "Age"]);
      expect(filtered.data).to.deep.equal([
        { ID: 2, Name: "Jane", Age: 30 },
        { ID: 3, Name: "Sam", Age: 28 },
      ]);
    });

    it("should return an empty DataFrame if no rows satisfy the condition", () => {
      const filtered = df.filter((row) => row.Age > 30);
      expect(filtered.columns).to.deep.equal(["ID", "Name", "Age"]);
      expect(filtered.data).to.deep.equal([]);
    });
  });

  describe("sortBy", () => {
    it("should sort the DataFrame based on columns in ascending order", () => {
      const sorted = df.sortBy(["Age"]);
      expect(sorted.columns).to.deep.equal(["ID", "Name", "Age"]);
      expect(sorted.data).to.deep.equal([
        { ID: 1, Name: "John", Age: 25 },
        { ID: 3, Name: "Sam", Age: 28 },
        { ID: 2, Name: "Jane", Age: 30 },
      ]);
    });

    it("should sort the DataFrame based on columns in descending order", () => {
      const sorted = df.sortBy(["Age"], false);
      expect(sorted.columns).to.deep.equal(["ID", "Name", "Age"]);
      expect(sorted.data).to.deep.equal([
        { ID: 2, Name: "Jane", Age: 30 },
        { ID: 3, Name: "Sam", Age: 28 },
        { ID: 1, Name: "John", Age: 25 },
      ]);
    });
  });

  describe("groupBy", () => {
    it("should group the DataFrame by columns", () => {
      const grouped = df.groupBy(["Age"]);
      expect(grouped.columns).to.deep.equal(["column1"]);
      expect(grouped.data).to.deep.equal([
        { column1: { ID: 1, Name: "John", Age: 25 } },
        { column1: { ID: 2, Name: "Jane", Age: 30 } },
        { column1: { ID: 3, Name: "Sam", Age: 28 } },
      ]);
    });
  });

  describe("aggregate", () => {
    it("should aggregate column values using specified functions", () => {
      const aggregations = {
        ID: (values) => values.join(","),
        Age: (values) => Math.max(...values),
      };
      const aggregated = df.aggregate(aggregations);
      expect(aggregated).to.deep.equal({ ID: "1,2,3", Age: 30 });
    });

    it("should throw an error if an invalid aggregation function is provided", () => {
      const aggregations = {
        ID: "sum",
      };
      expect(() => df.aggregate(aggregations)).to.throw(
        "Invalid aggregation function for column 'ID'"
      );
    });
  });

  describe("mean", () => {
    it("should calculate the mean of a numeric column", () => {
      const mean = df.mean("Age");
      expect(mean).to.equal(27.666666666666668);
    });
  });

  describe("median", () => {
    it("should calculate the median of a numeric column", () => {
      const median = df.median("Age");
      expect(median).to.equal(28);
    });
  });

  describe("mode", () => {
    it("should calculate the mode of a column", () => {
      const mode = df.mode("Age");
      expect(mode).to.eql([25, 30, 28]);
    });
  });

  describe("std", () => {
    it("should calculate the standard deviation of a numeric column", () => {
      const std = df.std("Age");
      expect(std).to.eql(2.0548046676563256);
    });
  });
});
