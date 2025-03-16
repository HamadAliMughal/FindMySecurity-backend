export const convertIntervalToMonths = (
  interval: string,
  intervalCount: number = 1
): string => {
  let intervalInMonths: number;

  switch (interval) {
    case "day":
      intervalInMonths = Math.ceil((intervalCount * 1) / 30); 
      break;
    case "week":
      intervalInMonths = Math.ceil((intervalCount * 7) / 30); 
      break;
    case "month":
      intervalInMonths = intervalCount;
      break;
    case "year":
      intervalInMonths = intervalCount * 12;
      break;
    default:
      intervalInMonths = intervalCount; 
  }

  return intervalInMonths === 1 ? "1 month" : `${intervalInMonths} months`;
};
