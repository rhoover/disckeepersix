
function dateFormatter(incomingDate) {
  return `${incomingDate.getMonth()+1}/${incomingDate.getDate()}/${incomingDate.getFullYear()}`;
};

export { dateFormatter };