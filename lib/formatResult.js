const path = require('path');
const xml = require('./xml');
const formatDescription = require('./formatDescription');

module.exports = formatResult;

function formatFailure(messages, filePath, type) {
	if (messages.length === 0) return '';

	const description = messages
		.map(message => formatDescription(message, filePath))
		.join('\n');

	return xml.createNode(
		'failure',
		{
			type,
			message: `Eslint ${type}s: ${filePath}`
		},
		xml.cData(description)
	);
}

/**
 *
 * @param {Result} result
 * @return {string}
 */
function formatResult(result) {
	const filePath = path.relative('', result.filePath);

	const errorMessages = result.messages.filter(
		message => message.severity === 2 || message.fatal
	);
	const errorfailure = formatFailure(errorMessages, filePath, 'error');

	const warningMessages = result.messages.filter(
		message => message.severity === 1 && !message.fatal
	);
	const warningFailure = formatFailure(warningMessages, filePath, 'warning');

	const message = `${filePath} - ${result.messages.length} issue(s)`;

	const failures = [errorfailure, warningFailure].filter(f => !!f).join('');

	if (!failures) return '';

	return xml.createNode(
		'testcase',
		{
			time: 0,
			classname: filePath,
			id: filePath,
			name: message
		},
		failures
	);
}
