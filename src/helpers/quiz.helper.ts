export function generateCorrectAnswersArr(arr: Array<any>) {
  const result: any[] = [];
  arr.forEach((question) => {
    question.answers.forEach((answer: any) => {
      if (answer.correct) {
        result.push(answer.id.toString());
      }
    })
  });
  return result;
}

export function generateResults(userAnswers: any[], correctAnswers: any[]) {
  const result: boolean[] = []
  userAnswers.forEach((answer: any, index: number) => {
    if (answer === correctAnswers[index]) {
      result.push(true);
    } else {
      result.push(false);
    }
  })
  return result;
}
