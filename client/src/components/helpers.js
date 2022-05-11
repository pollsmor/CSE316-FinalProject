const months = ['0-index', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Return date string in arr[0]. and time string in arr[1]
export function parseTime(isoString) {
  let datetime = new Date(isoString);

  let month = months[datetime.getMonth()];
  let day = datetime.getDate();
  if (day < 10) day = '0' + day;
  let date = `${month} ${day}, ${datetime.getFullYear()}`;

  let hour = datetime.getHours();
  if (hour < 10) hour = '0' + hour;
  let minute = datetime.getMinutes();
  if (minute < 10) minute = '0' + minute;
  let seconds = datetime.getSeconds();
  if (seconds < 10) seconds = '0' + seconds;
  let time = `${hour}:${minute}:${seconds}`;

  return [date, time];
}

export function filterQuestions(questions, tagNames, stringNames) {
  let results = []; // Can contain dupes
  for (let q of questions) { // Loop through, push all relevant questions to array
    // Check if one of the tags of question match one in tagNames
    if (q.tags.some(tag => tagNames.includes(tag))) {
      results.push(q);
      continue; // Even if title word matches, don't need to add again
    }

    let titleWords = q.title.split(' ');
    titleWords = titleWords.map(e => e.toLowerCase());
    if (titleWords.some(word => stringNames.includes(word)))
      results.push(q);
  }

  // Filter out duplicate results
  let qstnIds = new Set();
  let output = []; // Array without dupes to be returned
  for (let result of results) {
    if (!qstnIds.has(result._id))
      output.push(result);

    qstnIds.add(result._id);
  }

  return output;
}

// Date 2 is the later time.
export function timeDiff(date1, date2) {
  let difference = date2.getTime() - date1.getTime();
  var daysDiff = Math.floor(difference / 1000 / 60 / 60 /24);
  difference -= daysDiff * 1000 * 60 * 60 * 24;

  let hoursDiff = Math.floor(difference / 1000 / 60 / 60);

  return daysDiff + ' days and ' + hoursDiff + ' hours';
}