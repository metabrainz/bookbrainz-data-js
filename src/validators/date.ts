import {ValidationError} from './base';
import {isNil as _isNil} from 'lodash';


function isEmpty(value: any): boolean {
	return _isNil(value) || value === '';
}

// eslint-disable-next-line complexity -- Date validation is complex unless we want to use a library
export function dateValidator(dayObj, monthObj, yearObj): void {
	const year = Number.parseInt(yearObj, 10);
	const month = Number.parseInt(monthObj, 10);
	const day = Number.parseInt(dayObj, 10);

	// Valid years are any integer value or, if month and day are also nil, nil
	if (isEmpty(yearObj)) {
		if (isEmpty(monthObj) && isEmpty(dayObj)) {
			return;
		}

		throw new ValidationError('Year must be entered if month and day are entered');
	}
	else if (!Number.isInteger(year)) {
		throw new ValidationError('Year is not an integer');
	}

	// Valid months are 1 through 12 or, if day is also nil, nil
	if (isEmpty(monthObj)) {
		if (isEmpty(dayObj)) {
			return;
		}

		throw new ValidationError('Month must be entered if day is entered');
	}
	else if (!Number.isInteger(month) || month < 1 || month > 12) {
		throw new ValidationError('Month is not a valid integer');
	}

	// Valid days are dependent on the month, but nil is also valid
	if (!isEmpty(dayObj)) {
		if (!Number.isInteger(day) || day < 1 || day > 31) {
			throw new ValidationError('Day is not a valid integer');
		}
		else if ((month === 4 || month === 6 || month === 9 || month === 11) && day === 31) {
			throw new ValidationError('Day is not valid for this month');
		}
		else if (month === 2) {
			const isLeapYear = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;

			if (day > 29) {
				throw new ValidationError('Day is not valid for this month');
			}
			else if (day === 29 && !isLeapYear) {
				throw new ValidationError('Year is not leap, day is not valid for this month');
			}
		}
	}
}
