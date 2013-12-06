exports.extend = variadic( function (consumer, providers) {
	var key,
		i,
		provider;

	for (i = 0; i < providers.length; ++i) {
		provider = providers[i];
		for (key in provider) {
			if (provider.hasOwnProperty(key)) {
				consumer[key] = provider[key]
			}
		}
	}

	return consumer;
});

function variadic (fn) {
	var __slice = Array.prototype.slice,
		fnLength = fn.length;

	if (fnLength < 1) {
		return fn;
	}
	else if (fnLength === 1)  {
		return function () {
			return fn.call(
				this, __slice.call(arguments, 0))
		}
	}
	else {
		return function () {
			var numberOfArgs = arguments.length,
					namedArgs = __slice.call(
						arguments, 0, fnLength - 1),
					numberOfMissingNamedArgs = Math.max(
						fnLength - numberOfArgs - 1, 0),
					argPadding = new Array(numberOfMissingNamedArgs),
					variadicArgs = __slice.call(
						arguments, fn.length - 1);

			return fn.apply(
				this, namedArgs
							.concat(argPadding)
							.concat([variadicArgs]));
		}
	}
};