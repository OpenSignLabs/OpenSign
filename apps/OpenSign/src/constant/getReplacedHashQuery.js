import Parse from "parse";
/**
 * Function returning the queryString in which multiple hash replaced with actual values
 * @param str query string
 *  @param json localstroage data in json
 */

export default function getReplacedHashQuery(str, json) {
  // eslint-disable-next-line
  let reg = /(\#.*?\#)/gi;
  const currentUser = Parse.User.current();
  const multiHash = str.match(reg);

  let values = {};
  let key = "";
  multiHash.forEach((x) => {
    key = x;
    key = key.substring(1, key.length - 1);
    key = key.split(".");
    if (key.length > 1) {
      key = x.replace(reg, json[key[0]][key[1]]);
    } else if (json[key[0]]) {
      key = x.replace(reg, json[key[0]]);
    } else if (key[0] === "Date") {
      key = x.replace(reg, "Date");
    } else if (key[0] === "today") {
      key = x.replace(reg, new Date().toISOString());
    } else {
      key = x.replace(reg, currentUser.id);
    }
    values = { ...values, [x]: key };
  });
  const querySplit = str.split(reg);
  const replacedHashWithValuesArr = querySplit.map((hash) =>
    values[hash] ? values[hash] : hash
  );
  const HashFreeQuery = replacedHashWithValuesArr.join("");
  // console.log("HashFreeQuery ", HashFreeQuery);
  return HashFreeQuery;
}
