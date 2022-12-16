import moment, * as moments from 'moment';
import { extendMoment } from 'moment-range';
import {Schedule} from "../interfaces/schedule.interface";

const momentExt = extendMoment(moments);

export function generateWorkloadData(weekStart: Date, weekEnd: Date, data: Schedule[]) {
  const range = momentExt.range(weekStart, weekEnd);
  const fullRange = range.snapTo('day');
  const arr = Array.from(fullRange.by("d"))
  const dataset: any = [];
  const dates: string[] = [];
  arr.forEach((el) => {
    const date = el.format().slice(5,10).split('-').reverse().join('.');
    dataset.push({ date, hours: 0 });
    dates.push(date);
  });
  data.forEach((el) => {
    console.log(el)
    const date = el.start.toISOString().slice(5,10).split('-').reverse().join('.');
    const datasetIndex = dates.indexOf(date);
    const start = moment(new Date(el.start));
    const end = moment(new Date(el.end));
    const lessonDuration = moment.duration(end.diff(start)).asHours();
    console.log(lessonDuration)
    dataset[datasetIndex].hours = Number(Math.floor(dataset[datasetIndex].hours + lessonDuration).toFixed(1))
  })
  return [{hours: 2, empty: true }, ...dataset, {hours: 2, empty: true }];
}

export function getPeriodInNumber(period: string) {
  switch (period) {
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    case 'year':
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export function gradesObjConcat(events: any[], homeworks: any[]) {
  const eventsObjArr = events;
  const homeworksObjArr = homeworks;
  const eventsArr = eventsObjArr.flatMap(( {name }) => name);
  const homeworkArr = homeworksObjArr.flatMap(( {name }) => name);
  homeworkArr.forEach((el, index) => {
    if (eventsArr.includes(el)) {
      const eventIndex = eventsArr.indexOf(el);
      eventsObjArr[eventIndex].grade = (Number(eventsObjArr[eventIndex].grade) + Number(homeworksObjArr[index].grade)) / 2;
    } else {
      eventsObjArr.push(homeworksObjArr[index]);
    }
  })
  return eventsObjArr.sort((a,b) => {
    if (a.name < b.name) {return -1;}
    if (a.name > b.name) {return 1;}
    return 0;
  });
}