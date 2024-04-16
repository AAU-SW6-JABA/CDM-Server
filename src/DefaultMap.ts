/**
 * A normal Map but it has an extra method which allows you to quickly set a default value if there was no existing value.
 */
export class DefaultMap<KEY, VAL> extends Map<KEY, VAL> {
	constructor(
		/**
		 * The constructor that is called to generate a new default value.
		 */
		defaultValueConstructor: () => VAL,
	) {
		super();
		this.#defaultValueConstructor = defaultValueConstructor;
	}
	#defaultValueConstructor: () => VAL;

	/**
	 * Get a value from a key. If there is no value, initialize it with the default value and return that value.
	 * @param key - The key to to find the value with.
	 * @returns - The value associated with the key.
	 */
	getSet(key: KEY): VAL {
		let val = super.get(key);
		if (val === undefined) {
			val = this.#defaultValueConstructor();
			super.set(key, val);
		}
		return val;
	}
}
