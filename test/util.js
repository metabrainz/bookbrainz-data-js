import {formatDate, parseDate} from '../src/util';

import chai from 'chai';


const {expect} = chai;
const INVALID_DATES_TO_PARSE = [
	'I am certainly not a date',
	'--not-date',
	'invalid---',
	'---',
	'----',
	'',
	null,
	// eslint-disable-next-line no-undefined
	undefined
];
const INVALID_DATES_TO_FORMAT = [
	[],
	['a'],
	['a', 1],
	[null, 1, 3],
	[undefined, 1, 3]
];

function isDateInvalid(invalidDate) {
	const notADateResult = parseDate(invalidDate);
	return Array.isArray(notADateResult) &&
	notADateResult.length === 3 &&
	notADateResult[0] === null &&
	notADateResult[1] === null &&
	notADateResult[2] === null;
}

describe('Utils', () => {
	describe('parseDate', () => {
		it('should return an array of 3 null values when passed an invalid string (other than ISO 8601)', () => {
			const result = INVALID_DATES_TO_PARSE.reduce((res, date) =>
				res || !isDateInvalid(date), false);
			expect(result).to.be.false;
		});

		it('should return the date as an array of 3 values when passed a full ISO 8601 date string', () => {
			const parsedDate = parseDate('1925-01-04');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(1925);
			expect(parsedDate[1]).to.equal(1);
			expect(parsedDate[2]).to.equal(4);
		});

		it('should return the date as an array of 3 values when passed an extended ISO 8601-2004 date string', () => {
			const parsedDate = parseDate('+001925-01-04');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(1925);
			expect(parsedDate[1]).to.equal(1);
			expect(parsedDate[2]).to.equal(4);
		});

		it('should allow partial dates with missing day', () => {
			const parsedDate = parseDate('1925-01');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(1925);
			expect(parsedDate[1]).to.equal(1);
			expect(parsedDate[2]).to.be.null;
		});

		it('should allow partial dates with missing day and month', () => {
			const parsedDate = parseDate('1925');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(1925);
			expect(parsedDate[1]).to.be.null;
			expect(parsedDate[2]).to.be.null;
		});

		it('should allow BCE dates as extended ISO 8601-2004 date string', () => {
			const parsedDate = parseDate('-0001925-01-04');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(-1925);
			expect(parsedDate[1]).to.equal(1);
			expect(parsedDate[2]).to.equal(4);
		});

		it('should allow partial BCE dates as extended ISO 8601-2004 with missing day', () => {
			const parsedDate = parseDate('-000025-01');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(-25);
			expect(parsedDate[1]).to.equal(1);
			expect(parsedDate[2]).to.be.null;
		});

		it('should allow partial BCE dates as extended ISO 8601-2004 with missing day and month', () => {
			const parsedDate = parseDate('-000100');
			expect(parsedDate).to.be.an('array');
			expect(parsedDate.length).to.equal(3);
			expect(parsedDate[0]).to.equal(-100);
			expect(parsedDate[1]).to.be.null;
			expect(parsedDate[2]).to.be.null;
		});
	});
	describe('formatDate', () => {
		it('should return null when passed an invalid date object', () => {
			const result = INVALID_DATES_TO_FORMAT.reduce((res, date) =>
				res || formatDate(...date) !== null, false);
			expect(result).to.be.false;
		});

		it('should return the date as ISO 8601 for a full date object', () => {
			const parsedDate = formatDate(1925, 4, '28');
			expect(parsedDate).to.equal('1925-04-28');
		});

		it('should return the date as ISO 8601 for a date object with missing month', () => {
			const parsedDate = formatDate('1925', '4');
			expect(parsedDate).to.equal('1925-04');
		});

		it('should return the date as ISO 8601 for a date object with missing month and day', () => {
			const parsedDate = formatDate(1925);
			expect(parsedDate).to.equal('1925');
		});

		it('should allow negative years for full date and with missing month and/or day', () => {
			let parsedDate = formatDate(-1925);
			expect(parsedDate).to.equal('-1925');
			parsedDate = formatDate('-1925', 4);
			expect(parsedDate).to.equal('-1925-04');
			parsedDate = formatDate(-1925, '4', '04');
			expect(parsedDate).to.equal('-1925-04-04');
		});
	});
});
