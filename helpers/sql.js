const { BadRequestError } = require('../expressError');

/**
 * Helper function for making partial update queries.
 * 
 * @accepts {Object, Object} {dataToUpdate, jsToSql}
 * @param dataToUpdate {Object} has actual data values that are queried to db 
 * for update.
 * @param jsToSql {Object} contains the db column names for the keys provided 
 * in dataToUpdate.
 * @returns {Object} {setCols, values} 
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // get keys from data to update object
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
  return {
    // joined str of all db columns corresponding to their param num for update
    setCols: cols.join(', '),
    // array of values corresponding to their param num in setCols
    values: Object.values(dataToUpdate),
  };
}

/**
 * Helper function for making partial update queries for companies.
 * 
 * @accepts {Object} {filter}
 * @param filter {Object} from query that includes keys and values to filter in
 * an SQL query
 * @returns {Object} {sqlFilter} 
 */
function getSqlWhereCompanyFilters(filter) {
  const { name, minEmployees, maxEmployees } = filter;

  let sqlFilter = '';
  // if a filter exists create WHERE Clause
  if (name || minEmployees || maxEmployees) {
    // throw error if minEmployes > maxEmployees
    if (minEmployees && maxEmployees && minEmployees > maxEmployees) {
      throw new BadRequestError(
        `minEmployess cannot be greater than maxEmployees`
      );
    }
    // SQL statement for each filter in a WHERE Clause
    let nameSql = name ? `name ILIKE '%${name}%'` : '';
    let minSql = minEmployees ?
      `${nameSql ? 'AND ' : ''}num_employees >= ${minEmployees}` :
      '';
    let maxSql = maxEmployees ?
      `${nameSql || minSql ? 'AND ' : ''}num_employees <= ${maxEmployees}` :
      '';

    // concatenate filter statements into WHERE clause string
    sqlFilter = `
      WHERE
        ${nameSql} ${minSql} ${maxSql}
      `;
  }
  return sqlFilter;
}

/**
 * Helper function for making partial update queries for jobs.
 * 
 * @accepts {Object} {filter}
 * @param filter {Object} from query that includes keys and values to filter in
 * an SQL query
 * @returns {Object} {sqlFilter} 
 */
function getSqlWhereJobFilters(filter) {
  const { title, minSalary, hasEquity } = filter;

  let sqlFilter = '';
  // if a filter exists create WHERE Clause
  if (title || minSalary || hasEquity) {
    // SQL statement for each filter in a WHERE Clause
    let titleSql = title ? `title ILIKE '%${title}%'` : '';
    let minSalarySql = minSalary ?
      `${titleSql ? 'AND ' : ''}salary >= ${minSalary}` :
      '';
    let hasEquitySql = hasEquity ?
      `${titleSql || minSalarySql ? 'AND ' : ''}equity > 0` :
      '';

    // concatenate filter statements into WHERE clause string
    sqlFilter = `
      WHERE
        ${titleSql} ${minSalarySql} ${hasEquitySql}`;
  }
  return sqlFilter;
}

module.exports = {
  sqlForPartialUpdate,
  getSqlWhereCompanyFilters,
  getSqlWhereJobFilters,
};
