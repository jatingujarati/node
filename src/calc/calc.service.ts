import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CalcDto } from './calc.dto';

@Injectable()
export class CalcService {
  calculateExpression(calcBody: CalcDto) {
    // checking validation for the expression
    if (
      !/^[0-9+\-*/().\s]+$/.test(calcBody.expression) ||
      /[+\-*/]{2,}/.test(calcBody.expression) ||
      /^[+\-*/]/.test(calcBody.expression) ||
      /[+\-*/]$/.test(calcBody.expression)
    )
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Invalid expression provided',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );

    // Wer can do this all the things in one line without using eval !!!
    // const myResult = new Function(`return ${calcBody.expression}`)();

    const allElements = calcBody.expression.match(/\d+|\+|\-|\*|\/|\(|\)/g);

    const operatorOrder: { [key: string]: number } = {
      '-': 1,
      '+': 1,
      '*': 2,
      '/': 2,
    };

    const allNumbers: string[] = [];
    const allOperators: string[] = [];

    allElements.forEach((element) => {
      if (!isNaN(Number(element))) {
        allNumbers.push(element);
      } else if (element === '(') {
        allOperators.push(element);
      } else if (element === ')') {
        while (
          allOperators.length &&
          allOperators[allOperators.length - 1] !== '('
        ) {
          allNumbers.push(allOperators.pop());
        }
        allOperators.pop();
      } else {
        while (
          allOperators.length &&
          operatorOrder[allOperators[allOperators.length - 1]] >=
          operatorOrder[element]
        ) {
          allNumbers.push(allOperators.pop());
        }
        allOperators.push(element);
      }
    });

    while (allOperators.length) {
      allNumbers.push(allOperators.pop());
    }

    const myStack: number[] = [];
    allNumbers.forEach((eachNum) => {
      if (/\d/.test(eachNum)) {
        myStack.push(Number(eachNum));
      } else {
        const b = myStack.pop();
        const a = myStack.pop();
        switch (eachNum) {
          case '+':
            myStack.push(a + b);
            break;
          case '-':
            myStack.push(a - b);
            break;
          case '*':
            myStack.push(a * b);
            break;
          case '/':
            myStack.push(a / b);
            break;
          default:
            throw new HttpException(
              {
                statusCode: 400,
                message: 'Invalid expression provided',
                error: 'Bad Request',
              },
              HttpStatus.BAD_REQUEST,
            );
        }
      }
    });

    const finalResult = myStack.pop();

    return finalResult;
  }
}
